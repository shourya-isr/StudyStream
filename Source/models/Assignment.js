// Sequelize model for Assignment
export default (sequelize, DataTypes) => {
  const Assignment = sequelize.define('Assignment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  course: { type: DataTypes.STRING },
  due_date: { type: DataTypes.DATE, allowNull: false },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  media: { type: DataTypes.STRING }, // absolute file path for image/pdf
  estimatedhours: { type: DataTypes.FLOAT, defaultValue: 0 },
  rationale: { type: DataTypes.TEXT },
  complexity: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('active', 'cancelled', 'deleted'), defaultValue: 'active' },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'assignments',
    timestamps: false,
  });
  return Assignment;
};
