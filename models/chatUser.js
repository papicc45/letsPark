const { DataTypes } = require("sequelize");

const Model = (sequelize) => {
  return sequelize.define("chatuser", {
    //컬럼 정의
    roomid: {
      type: DataTypes.INTEGER,
      allowNull: false, //NOT NULL
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};

module.exports = Model;
