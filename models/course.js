'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Course.belongsTo(models.User,{
        foreignKey:{
          fieldName:'userId',
          allowNull: false
        }
      })
    }
  }
  Course.init({
    title:{
      type:DataTypes.STRING,
      allowNull:false,
      validate :{
        notNull :{
          msg:" Course Title is Required"
        },
        notEmpty:{
          msg:"Please Provide a Course Title"
        }
      }
    } ,
    description :{
      type:DataTypes.TEXT,
      allowNull:false,
      validate:{
        notNull:{
          msg:"Course Description is Required"
        },
        notEmpty:{
          msg:"please provide course description "
        }
      }
    },
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};