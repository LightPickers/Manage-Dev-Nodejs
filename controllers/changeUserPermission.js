const { dataSource } = require("../db/data-source");
const AppError = require("../utils/appError");
const ERROR_MESSAGES = require("../utils/errorMessages");

const changeUserPermission = async (req, res, next) => {
  const { id, is_banned } = req.body;

  if (typeof is_banned !== "boolean") {
    return next(new AppError(400, "格式錯誤，is_banned須為布林值"));
  }

  try {
    const userRepo = dataSource.getRepository("Users");
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      return next(new AppError(400, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    if (user.is_banned === is_banned) {
      return res.status(200).json({
        status: true,
        massage: `使用者已經是${is_banned ? "停權" : "啟用"}狀態`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          is_banned: is_banned,
        },
      });
    }
    user.is_banned = is_banned;
    await userRepo.save(user);

    return res.status(200).json({
      status: true,
      message: `使用者狀態已更新，使用者已${is_banned ? "停權" : "啟用"}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        is_banned: is_banned,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  changeUserPermission,
};

//if (typeof is_banned !== "boolean") {
//  return next(new AppError(400, "格式錯誤，is_banned須為布林值"));
//}

//try {
//  const userRepo = dataSource.getRepository("Users");
//  const user = await userRepo.findOne({ where: { id } });

//  if (!user) {
//    return next(new AppError(400, ERROR_MESSAGES.USER_NOT_FOUND));
//  }

//  if (user.is_banned === is_banned) {
//    return res.status(200).json({
//         status: true,
//         message: `使用者已經是${is_banned ? "停權" : "啟用"}狀態`,
//         user: {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           is_banned: user.is_banned,
//         },
//       });
//     }

//     user.is_banned = is_banned;
//     await userRepo.save(user);

//     return res.status(200).json({
//       status: true,
//       message: `使用者狀態已更新，使用者已${is_banned ? "停權" : "啟用"}`,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         is_banned: user.is_banned,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   changeUserPermission,
// };
