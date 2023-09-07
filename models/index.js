'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

//db 테이블 생성
db.PublicParking = require('./PublicParking')(sequelize);
db.OperationTime = require('./OperationTime')(sequelize);
db.Price = require('./Price')(sequelize);
db.User = require('./User')(sequelize);

//연관관계 설정
db.PublicParking.hasOne(db.OperationTime, {
  foreignKey: 'publicparking_id',
  sourceKey: 'id',
});
db.PublicParking.hasOne(db.Price, {
  foreignKey: 'publicparking_id',
  sourceKey: 'id',
});
db.OperationTime.belongsTo(db.PublicParking, {
  foreignKey: 'publicparking_id',
  sourceKey: 'id',
});
db.Price.belongsTo(db.PublicParking, {
  foreignKey: 'publicparking_id',
  sourceKey: 'id',
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
