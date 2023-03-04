// rough draft index.js



var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    
    host: "localhost",
    
    port: 3306,    //mySQL port number
    
    user: "root",
    
    password: "",
   
    database: "employee_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log(msgBox);
    start();
});

function start() {
    inquirer
        .prompt({
            name: "question",
            type: "list",
            message: "Choose from the list of actions:",
            choices: ["Add a new Department", "Add a new Role", "Add a new Employee", "View Departments", "View Roles", "View Employees", "Exit"]
        })
        .then(function (answer) {
            if (answer.question === "Add a new Department") {
                newDepartment();
            }
            else if (answer.question === "Add a new Role") {
                newRole();
            }
            else if (answer.question === "Add a new Employee") {
                newEmployee();
            }
            else if (answer.question === "View Departments") {
                viewDepartments();
            }
            else if (answer.question === "View Roles") {
                viewRoles();
            }
            else if (answer.question === "View Employees") {
                viewEmployees();
            }
            else {
                connection.end();
            }
        });
}





function newDepartment() {
    inquirer
        .prompt([
            {
                name: "department",
                type: "input",
                message: "Which department do you want to add"
            },
        ])
        .then(function (answer) {
            connection.query(
            "Insert into department set ;",
            {
            department_name: answer.department,
            },
            
            
            function (err) {
                if (err) throw err;
                    console.log("The department was added");
                    start();
                }
            );
        });
}




function newRole() {
    let departments = []

    connection.query("Select the department_name, department_id from department;", function (err, results) {
        if (err) throw err;

        for (var i = 0; i < results.length; i++) {
            let storedDepartment = results[i].department_name;
            departments.push(storedDepartment);
        }

        inquirer
            .prompt([
                {
                    name: "role",
                    type: "input",
                    message: "Which title did wou want to add"
                },
                {
                    name: "salary",
                    type: "input",
                    message: "Enter a salary"
                },
                {
                    name: "department",
                    type: "list",
                    message: "Choose a department",
                    choices: departments
                },
            ])
            .then(function (answer) {
                console.log(answer.department)
                let deptID
                for (var i = 0; i < results.length; i++) {
                    if (results[i].department_name === answer.department) {
                        deptID = results[i].department_id;
                    }
                }
                connection.query(
                    "Insert into roles SET ?;",
                    {
                        title: answer.role,
                        salary: answer.salary,
                        department_id: deptID
                    },
                    function (err) {
                        if (err) throw err;
                        console.log("This role was added");
                        start();
                    }
                )
            })
    })
}





function newEmployee() {
    let roles = []

    connection.query("Select title, role_id from roles;", function (err, results) {
        if (err) throw err;

        for (var i = 0; i < results.length; i++) {
            let storedRole = results[i].title;
            roles.push(storedRole);
        }
        inquirer
            .prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "Enter the first name of the new employee"
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "Enter the last name of the new employee"
                },
                {
                    name: "role",
                    type: "list",
                    message: "Enter a role for this employee",
                    choices: roles,
                }])
            .then(function (answer) {
                let roleID
                for (var i = 0; i < results.length; i++) {
                    if (results[i].title === answer.role) {
                        roleID = results[i].role_id;
                    }
                }
                connection.query(
                    "Insert into employee set?;",
                    {
                        first_name: answer.first,
                        last_name: answer.last,
                        role_id: roleID,
                    },
                    function (err) {
                        if (err) throw err;
                        console.log("The employee was added");
                        start();
                    }
                );
            });
    })
}





function viewDepartments() {
    let sql = "Select * from department;"
    connection.query(sql, function (err, results) {
        if (err) throw err;
        console.table(results);
        start();
    })
}





function viewRoles() {
    let sql = "Select * from roles left join department on roles.department_id = department.department_id;"
    connection.query(sql, function (err, results) {
        if (err) throw err;
        console.table(results);
        start();
    })
}





function viewEmployees() {
    let sql = "Select * from employee left join roles on roles.role_id = employee.role_id left join department on roles.department_id = department.department_id;"
    connection.query(sql, function (err, results) {
        if (err) throw err;
        console.table(results);
        start();
    })
}





function UpdateEmployeeRole() {
    let name = []
    let roles = []
    connection.query("Select first_name,last_name from employee;", function (err, results) {
        if (err) throw err;

        for (var i = 0; i < results.length; i++) {
            let storedName = `${results[i].first_name} ${results[i].last_name}`;
            name.push(storedName);
        }

        connection.query("Select title, role_id from roles;", function (err, results) {
            if (err) throw err;

            for (var i = 0; i < results.length; i++) {
                let storedRole = results[i].title;
                roles.push(storedRole);
            }

            inquirer
                .prompt([
                    {
                        name: "employee",
                        type: "list",
                        message: "Which Employee would you like to update?",
                        choices: name
                    },
                    {
                        name: "changeRole",
                        type: "list",
                        message: "What role would you like to update this employee to?",
                        choices: roles
                    }]).then(function (answer) {
                        let chosenName = answer.employee
                        let firstName = chosenName.toString().split(" ");
                        console.log(firstName[0])
                        console.log(typeof (firstName[0]))
                        let roleID
                        for (var i = 0; i < results.length; i++) {
                            if (results[i].title === answer.change) {
                                roleID = results[i].role_id;
                            }
                        }
                        let sql = `Update employee set role_id = ${roleID} where first_name = '${firstName[0]}' and last_name= '${firstName[1]}';`
                        connection.query(sql, function (err, results) {
                            if (err) throw err;
                            console.log("Your employee was updated successfully!");
                            start();
                        })
                    })
        })
    })
}