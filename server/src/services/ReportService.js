const Borrow = require('../models/Borrow');

class ReportService {
  async getBorrowedBooksStats() {
    const stats = await Borrow.aggregate([
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
                _id: '$book.categoryId',
                count: { $sum: 1 }
              }
            },
            {
              $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'categoryInfo'
              }
            },
            { $unwind: '$categoryInfo' },
            {
              $project: {
                name: '$categoryInfo.name',
                count: 1
              }
            }
          ]
        }
      }
    ]);

    return {
      totalBorrowed: stats[0].totalBorrowedCount[0]?.count || 0,
      byCategory: stats[0].byCategory
    };
  }

  async getLibraryStats() {
    const Book = require('../models/Book');
    const Reader = require('../models/Reader');

    // Detailed book statistics
    const bookStatusStats = await Book.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$quantity' },
          available: { $sum: '$available' },
          borrowed: { $sum: '$borrowed' }
        }
      }
    ]).allowDiskUse(true);

    const totalReaders = await Reader.countDocuments({ status: { $ne: 'inactive' } });
    const now = new Date();
    
    // Combined borrow and problem statistics in one pass
    const combinedStats = await Borrow.aggregate([
      {
        $group: {
          _id: null,
          totalBorrows: { $sum: 1 },
          activeBorrows: { 
            $sum: { 
              $cond: [
                { $in: ['$status', ['borrowed', 'overdue']] }, 
                1, 0
              ] 
            } 
          },
          pendingRequests: { 
            $sum: { 
              $cond: [
                { $in: ['$status', ['pending', 'approved']] }, 
                1, 0
              ] 
            } 
          },
          overdueBorrows: { 
            $sum: { 
              $cond: [
                { 
                  $or: [
                    { $eq: ['$status', 'overdue'] },
                    { 
                      $and: [
                        { $eq: ['$status', 'borrowed'] },
                        { $lt: ['$dueDate', now] }
                      ]
                    }
                  ]
                }, 
                1, 0
              ] 
            } 
          },
          damaged: { $sum: { $cond: [{ $in: ['$status', ['damaged', 'damaged_heavy']] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } },
          totalViolationAmount: { $sum: '$violation.amount' },
          unpaidViolationAmount: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ['$violation.amount', 0] }, { $ne: ['$violation.isPaid', true] }] },
                '$violation.amount',
                0
              ]
            }
          }
        }
      }
    ]).allowDiskUse(true);

    const bookStats = bookStatusStats[0] || { total: 0, available: 0, borrowed: 0 };
    const stats = combinedStats[0] || { 
      totalBorrows: 0, activeBorrows: 0, pendingRequests: 0, 
      overdueBorrows: 0, damaged: 0, lost: 0, 
      totalViolationAmount: 0, unpaidViolationAmount: 0 
    };

    // Calculate absolute total including lost books for consistent 100% sum
    const absoluteTotal = (bookStats.available || 0) + (bookStats.borrowed || 0) + (stats.lost || 0);
    const availableNet = Math.max(0, (bookStats.available || 0) - (stats.damaged || 0));

    return {
      bookStats: {
        total: absoluteTotal,
        available: availableNet,
        borrowed: bookStats.borrowed || 0,
        damaged: stats.damaged || 0,
        lost: stats.lost || 0
      },
      readerStats: { totalReaders },
      borrowStats: stats
    };
  }

  async getTopReaders(limit = 10) {
    const topReaders = await Borrow.aggregate([
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

  async getTopBooks(limit = 10) {
    const topBooks = await Borrow.aggregate([
      {
        $group: {
          _id: '$bookId',
          borrowCount: { $sum: 1 }
        }
      },
      { $sort: { borrowCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'bookInfo'
        }
      },
      { $unwind: '$bookInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'bookInfo.categoryId',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          borrowCount: 1,
          title: '$bookInfo.title',
          author: '$bookInfo.author',
          category: { $ifNull: ['$categoryInfo.name', '$bookInfo.category'] },
          isbn: '$bookInfo.isbn'
        }
      }
    ]).allowDiskUse(true);

    return topBooks;
  }

  async getRecentActivities(limit = 10) {
    const activities = await Borrow.find()
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .populate('readerId', 'fullName')
      .populate('bookId', 'title')
      .lean();

    return activities.map(activity => {
      let actionText = '';
      let type = 'action';

      switch (activity.status) {
        case 'pending':
          actionText = `Yêu cầu mượn: ${activity.bookId?.title}`;
          type = 'system';
          break;
        case 'borrowed':
          actionText = `Đã nhận sách: ${activity.bookId?.title}`;
          type = 'action';
          break;
        case 'approved':
          actionText = `Yêu cầu được chấp nhận: ${activity.bookId?.title}`;
          type = 'system';
          break;
        case 'returned':
          actionText = `Đã trả sách: ${activity.bookId?.title}`;
          type = 'action';
          break;
        case 'overdue':
          actionText = `Quá hạn: ${activity.bookId?.title}`;
          type = 'alert';
          break;
        case 'lost':
          actionText = `Mất sách: ${activity.bookId?.title}`;
          type = 'alert';
          break;
        case 'damaged':
        case 'damaged_heavy':
          actionText = `Trả sách hỏng: ${activity.bookId?.title}`;
          type = 'alert';
          break;
        case 'rejected':
          actionText = `Từ chối mượn: ${activity.bookId?.title}`;
          type = 'system';
          break;
        default:
          actionText = `Cập nhật trạng thái: ${activity.status}`;
      }

      return {
        id: activity._id,
        user: activity.readerId?.fullName || 'Ẩn danh',
        action: actionText,
        time: activity.updatedAt,
        type: type
      };
    });
  }

  async getBorrowReturnTrends(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Borrow.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          borrows: [
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
              }
            }
          ],
          returns: [
            {
              $match: {
                status: { $in: ['returned', 'damaged', 'damaged_heavy'] },
                returnDate: { $exists: true, $ne: null }
              }
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$returnDate" } },
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Format data for chart
    const result = [];
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      const borrowCount = trends[0].borrows.find(b => b._id === dateStr)?.count || 0;
      const returnCount = trends[0].returns.find(r => r._id === dateStr)?.count || 0;

      result.push({
        date: dateStr,
        label: date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' }),
        borrows: borrowCount,
        returns: returnCount
      });
    }

    return result;
  }

  async getExportData(type) {
    const Book = require('../models/Book');
    const Reader = require('../models/Reader');

    switch (type) {
      case 'books':
        return await Book.find({ isDeleted: false })
          .select('title author isbn category categoryId totalQuantity available borrowed location status')
          .populate('categoryId', 'name')
          .sort({ title: 1 })
          .lean();

      case 'readers':
        return await Reader.find()
          .select('username fullName email phone readerType status totalBorrowed currentBorrowCount')
          .sort({ fullName: 1 })
          .lean();

      case 'overdue':
        return await Borrow.find({ status: 'overdue' })
          .populate('readerId', 'username fullName phone')
          .populate('bookId', 'title isbn')
          .sort({ dueDate: 1 })
          .lean();

      case 'summary':
      default:
        return await this.getLibraryStats();
    }
  }
}

module.exports = new ReportService();
