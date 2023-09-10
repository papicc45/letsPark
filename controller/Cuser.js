const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const SECRET = 'SECRET';
//쿠키 설정
const cookieConfig = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000, //24시간으로 설정
};

//GET
exports.signup = (req, res) => {
  res.render('signup');
};
exports.login = (req, res) => {
  const { userid } = req.params;
  res.render('login', { userid });
};
exports.success = (req, res) => {
  const { userid, nickname } = req.params;
  res.render('success', { userid, nickname });
};
exports.profile = async (req, res) => {
  try {
    const { userid } = req.params;

    // 사용자 정보를 DB에서 조회
    const user = await User.findOne({
      where: { userid: userid },
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.render('profile', { user });
  } catch (error) {
    console.log(error);
  }
};

//POST
exports.postSignup = async (req, res) => {
  try {
    const { userid, password, name, nickname, phone } = req.body;
    const hashPw = bcryptPassword(password);

    const user = await User.create({
      userid,
      password: hashPw,
      name,
      nickname,
      phone,
    });
    res.json({ result: true, data: user }); // 회원가입 성공 시 사용자 정보를 반환
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ result: false, message: '회원가입에 실패했습니다.' });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { id, userid, password, name, nickname } = req.body;
    const user = await User.findOne({
      where: { userid },
    });

    if (user) {
      const result = comparePassword(password, user.password);
      if (result) {
        res.cookie('isLoggin', true, cookieConfig);
        const token = jwt.sign(
          {
            id: user.id,
            userid: userid,
            nickname: user.nickname,
            name: user.name,
          },
          SECRET
        );
        res.json({ result: true, token, data: user });
      } else {
        res.json({ result: false, message: '비밀번호가 틀렸습니다.' });
      }
    } else {
      res.json({ result: false, message: '존재하는 사용자가 없습니다.' });
    }
  } catch (error) {
    console.log('로그인 오류', error);
  }
};

exports.editProfile = (req, res) => {
  const { userid, password, name, nickname, phone } = req.body;

  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      const token = req.headers.authorization.split(' ')[1];
      const result = jwt.verify(token, SECRET);

      User.findOne({ where: { userid: result.userid } }).then((user) => {
        if (!user) {
          res.json({ result: false, message: '사용자가 존재하지 않습니다.' });
        } else {
          const maskedPassword = '*'.repeat(password.length);
          User.update(
            { password: maskedPassword, name, nickname, phone },
            { where: { userid: result.userid } }
          )
            .then(() => {
              res.json({ result: true });
            })
            .catch((error) => {
              console.error(error);
              res.status(500).json({
                result: false,
                message: '프로필 수정에 실패했습니다.',
              });
            });
        }
      });
    } else {
      res.json({ result: false, message: '인증방식이 틀렸습니다. ' });
    }
  } catch (error) {
    console.error(error);
    res.json({ result: false, message: '토큰 검증에 실패했습니다.' });
  }
};

//DELETE
exports.drop = (req, res) => {
  const { userid } = req.body;
  User.destroy({
    where: { userid },
  })
    .then(() => {
      res.clearCookie('isLoggin');
      //req.session.destroy();
      res.json({ result: true });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ result: false, message: '사용자 삭제에 실패했습니다.' });
    });
};

const bcryptPassword = (pw) => {
  return bcrypt.hashSync(pw, 10);
};
const comparePassword = (pw, dbPw) => {
  return bcrypt.compareSync(pw, dbPw);
};
