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
    ]);

    // For damaged and lost, we count from Borrow records
    const problemStats = await Borrow.aggregate([
      {
        $group: {
          _id: null,
          damaged: { $sum: { $cond: [{ $in: ['$status', ['damaged', 'damaged_heavy']] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', 'lost'] }, 1, 0] } }
        }
      }
    ]);

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

    const bookStats = bookStatusStats[0] || { total: 0, available: 0, borrowed: 0 };
    const pStats = problemStats[0] || { damaged: 0, lost: 0 };

    // Total for percentage calculations: active books + lost books
    const absoluteTotal = (bookStats.total || 0) + (pStats.lost || 0);

    return {
      bookStats: {
        ...bookStats,
        total: absoluteTotal, // Redefine total to include lost books for consistent %
        damaged: pStats.damaged,
        lost: pStats.lost
      },
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
        $project: {
          _id: 1,
          borrowCount: 1,
          title: '$bookInfo.title',
          author: '$bookInfo.author',
          category: '$bookInfo.category',
          isbn: '$bookInfo.isbn'
        }
      }
    ]);

    return topBooks;
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
          .select('title author isbn category totalQuantity available borrowed location status')
          .sort({ title: 1 });
      
      case 'readers':
        return await Reader.find()
          .select('username fullName email phone readerType status totalBorrowed currentBorrowCount')
          .sort({ fullName: 1 });

      case 'overdue':
        return await Borrow.find({ status: 'overdue' })
          .populate('readerId', 'username fullName phone')
          .populate('bookId', 'title isbn')
          .sort({ dueDate: 1 });

      case 'summary':
      default:
        return await this.getLibraryStats();
    }
  }
}

module.exports = new ReportService();
