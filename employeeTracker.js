const inquirer = require('inquirer');
const mysql = require('mysql');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'employee_db',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
  startApp();
});

function startApp() {
  inquirer
    .prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update an employee role',
        'Exit',
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case 'View all departments':
          viewAllDepartments();
          break;
        case 'View all roles':
          viewAllRoles();
          break;
        case 'View all employees':
          viewAllEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployeeRole();
          break;
        case 'Exit':
          connection.end();
          break;
      }
    });
}

function viewAllDepartments() {
  connection.query('SELECT * FROM departments', (err, results) => {
    if (err) throw err;
    console.table(results);
    startApp();
  });
}

function viewAllRoles() {
  connection.query('SELECT * FROM roles', (err, results) => {
    if (err) throw err;
    console.table(results);
    startApp();
  });
}

function viewAllEmployees() {
  connection.query(
    `SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.name AS department, roles.salary, CONCAT(managers.first_name, ' ', managers.last_name) AS manager
    FROM employees
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN employees managers ON employees.manager_id = managers.id`,
    (err, results) => {
      if (err) throw err;
      console.table(results);
      startApp();
    }
  );
}

function addDepartment() {
  inquirer
    .prompt({
      type: 'input',
      name: 'name',
      message: 'Enter the name of the department:',
    })
    .then((answer) => {
      connection.query('INSERT INTO departments SET ?', { name: answer.name }, (err) => {
        if (err) throw err;
        console.log('Department added successfully!');
        startApp();
      });
    });
}

function addRole() {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Enter the title of the role:',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Enter the salary for the role:',
      },
      {
        type: 'input',
        name: 'department_id',
        message: 'Enter the department ID for the role:',
      },
    ])
    .then((answer) => {
      connection.query('INSERT INTO roles SET ?', answer, (err) => {
        if (err) throw err;
        console.log('Role added successfully!');
        startApp();
      });
    });
}

function addEmployee() {
  // Assume that the manager_id can be null for employees without a manager
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'first_name',
        message: 'Enter the first name of the employee:',
      },
      {
        type: 'input',
        name: 'last_name',
        message: 'Enter the last name of the employee:',
      },
      {
        type: 'input',
        name: 'role_id',
        message: 'Enter the role ID for the employee:',
      },
      {
        type: 'input',
        name: 'manager_id',
        message: 'Enter the manager ID for the employee (can be null):',
      },
    ])
    .then((answer) => {
      connection.query('INSERT INTO employees SET ?', answer, (err) => {
        if (err) throw err;
        console.log('Employee added successfully!');
        startApp();
      });
    });
}

function updateEmployeeRole() {
  connection.query('SELECT * FROM employees', (err, employees) => {
    if (err) throw err;

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'employee_id',
          message: 'Select the employee to update:',
          choices: employees.map((employee) => ({
            name: `${employee.first_name} ${employee.last_name}`,
            value: employee.id,
          })),
        },
        {
          type: 'input',
          name: 'role_id',
          message: 'Enter the new role ID for the employee:',
        },
      ])
      .then((answer) => {
        connection.query(
          'UPDATE employees SET role_id = ? WHERE id = ?',
          [answer.role_id, answer.employee_id],
          (err) => {
            if (err) throw err;
            console.log('Employee role updated successfully!');
            startApp();
          }
        );
      });
  });
}
