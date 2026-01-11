class ReportService {
  constructor(borrowModel) {
    this.borrowModel = borrowModel;
  }

  async getBorrowedBooksStats() {
    const stats = await this.borrowModel.aggregate([
      {
        $facet: {
          totalBorrowedCount: [
            { $match: { status: { $in: ['borrowed', 'overdue'] } } },
            { $count: 'count' }
          ],
          byCategory: [
            { $match: { status: { $in: ['borrowed', 'overdue'] } } },
            {
              $lookup: {
                from: 'books',
                localField: 'bookId',
                foreignField: '_id',
                as: 'book'
              }
            },
            { $unwind: '$book' },
            {
              $group: {
                _id: '$book.category',
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    const result = {
      totalBorrowed: stats[0].totalBorrowedCount[0]?.count || 0,
      byCategory: stats[0].byCategory
    };

    return result;
  }

  async getTopReaders(limit = 10) {
    const topReaders = await this.borrowModel.aggregate([
      {
        $group: {
          _id: '$readerId',
          totalBorrows: { $sum: 1 },
          activeBorrows: {
            $sum: {
              $cond: [{ $in: ['$status', ['borrowed', 'overdue']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { totalBorrows: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'readers',
          localField: '_id',
          foreignField: '_id',
          as: 'readerInfo'
        }
      },
      { $unwind: '$readerInfo' },
      {
        $project: {
          _id: 1,
          totalBorrows: 1,
          activeBorrows: 1,
          name: '$readerInfo.fullName',
          email: '$readerInfo.email',
          username: '$readerInfo.username'
        }
      }
    ]);

    return topReaders;
  }
}

module.exports = ReportService;
