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
                _id: '$book.category',
                count: { $sum: 1 }
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
    
    const totalBooks = await Book.countDocuments({ isDeleted: { $ne: true } });
    const totalReaders = await Reader.countDocuments({ status: { $ne: 'inactive' } });
    const borrowStats = await Borrow.aggregate([
      {
        $group: {
          _id: null,
          totalBorrows: { $sum: 1 },
          activeBorrows: { $sum: { $cond: [{ $in: ['$status', ['borrowed', 'overdue']] }, 1, 0] } },
          pendingRequests: { $sum: { $cond: [{ $in: ['$status', ['pending', 'approved']] }, 1, 0] } },
          overdueBorrows: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } },
          totalFines: { $sum: '$fine.amount' },
          unpaidFines: { 
            $sum: { 
              $cond: [
                { $and: [{ $gt: ['$fine.amount', 0] }, { $ne: ['$fine.isPaid', true] }] },
                '$fine.amount',
                0
              ] 
            }
          }
        }
      }
    ]);

    return {
      bookStats: { totalBooks },
      readerStats: { totalReaders },
      borrowStats: borrowStats[0] || { 
        totalBorrows: 0, 
        activeBorrows: 0, 
        pendingRequests: 0, 
        overdueBorrows: 0,
        totalFines: 0,
        unpaidFines: 0
      }
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

  async getRecentActivities(limit = 10) {
    const activities = await Borrow.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('readerId', 'fullName')
      .populate('bookId', 'title');

    return activities.map(activity => {
      let actionText = '';
      let type = 'action';

      switch (activity.status) {
        case 'pending': 
          actionText = `Yêu cầu mượn: ${activity.bookId?.title}`;
          type = 'system';
          break;
        case 'borrowed':
          actionText = `Đã duyệt mượn: ${activity.bookId?.title}`;
          type = 'action';
          break;
        case 'returned':
          actionText = `Đã trả sách: ${activity.bookId?.title}`;
          type = 'action';
          break;
        case 'overdue':
          actionText = `Quá hạn: ${activity.bookId?.title}`;
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
}

module.exports = new ReportService();
