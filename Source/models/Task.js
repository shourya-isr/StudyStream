// Sequelize model for Task
export default (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assignment_id: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    planned_start: { type: DataTypes.DATE },
    planned_end: { type: DataTypes.DATE },
    actual_start: { type: DataTypes.DATE },
    actual_end: { type: DataTypes.DATE },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high'), defaultValue: 'medium' },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'tasks',
    timestamps: false,
  });
  return Task;
};
