var redmine = require('../module/redmine.js');
var printer = require('../module/printer.js');
var filter = require('./filter.js');

exports.handleConnect = function (url, apiKey) {
    try {
        var user = redmine.connect(url, apiKey);
        printer.printSuccessfullyConnected(url, user);
    } catch (err) {
        console.error(err)
    }
}

exports.handleProjects = function () {
    try {
        var projects = redmine.getProjects();
        printer.printProjects(projects);
    } catch (err) {
        console.error(err)
    }
}

exports.handleProject = function (identifier) {
    try {
        var project = redmine.getProject(identifier);
        var roles = redmine.getProjectMembershipsGroupedByRole(identifier);

        project.roles = roles;

        printer.printProject(project);
    } catch (err) {
        console.error(err)
    }
}

exports.handleUpdateProject = function (identifier, options) {
    try {
        redmine.updateProject(identifier, options);
        console.log('Successfully updated ' + identifier);
    } catch (err) {
        console.error(err)
    }
}

exports.handleCreateProject = function (name, identifier, options) {
    try {
        var project = redmine.createProject(name, identifier, options);
        console.log('Successfully created ' + project.project.identifier);
    } catch (err) {
        console.error(err)
    }
}

exports.handleIssues = function (options) {
    try {
        var filters = filter.issuesFiltersFrom(options);
        var issues = redmine.getIssues(filters);
        printer.printIssues(issues);
    } catch (err) {
        console.error(err)
    }
}

exports.handleIssue = function (id, options) {
    try {
        var issue = redmine.getIssue(id, options);
        printer.printIssue(issue.issue);
    } catch (err) {
        console.error(err)
    }
}

exports.handleUpdateIssue = function (id, options) {
    try {
        redmine.updateIssue(id, options);
        console.log('Successfully updated #' + id);
    } catch (err) {
        console.error(err)
    }
}

exports.handleCreateIssue = function (project, subject, options) {
    try {
        var issue = redmine.createIssue(project, subject, options);
        console.log('Successfully created #' + issue.issue.id);
    } catch (err) {
        console.error(err)
    }
}

exports.handleStatuses = function (options) {
    try {
        var statuses = redmine.getStatuses();
        printer.printStatuses(statuses);
    } catch (err) {
        console.error(err)
    }
}

exports.handleTrackers = function (options) {
    try {
        var trackers = redmine.getTrackers();
        printer.printTrackers(trackers);
    } catch (err) {
        console.error(err)
    }
}

exports.handlePriorities = function (options) {
    try {
        var priorities = redmine.getPriorities();
        printer.printPriorities(priorities);
    } catch (err) {
        console.error(err)
    }
}

exports.handleUsers = function (options) {
    try {
        var users = redmine.getUsers();
        printer.printUsers(users);
    } catch (err) {
        console.error(err)
    }
}

exports.handleUser = function (id) {
    try {
        var user = redmine.getUser(id);
        printer.printUser(user.user);
    } catch (err) {
        console.error(err)
    }
}

exports.handleOpen = function (id) {
    try {
        redmine.open(id);
    } catch (err) {
        console.error(err)
    }
}

exports.handleTime = function (id, hours, comments, options) {
    try {
        var logTime = redmine.logTime(id, hours, comments, options);
        console.log('Successfully created #' + logTime.time_entry.id);
    } catch (err) {
        console.error(err)
    }
}


exports.handleLogTime = function (options) {
    try {
        var filters = filter.logTimeFiltersFrom(options);
        var loggedTime = redmine.getLoggedTime(filters);
        filters.offset = loggedTime.offset;
        var resume = {};
        var days = [];
        var issues = [];
        while (filters.offset < loggedTime.total_count) {
            if (options.groupBy) {
                for (let entry of loggedTime.time_entries) {
                    resume[entry.spent_on] = (resume[entry.spent_on] || 0) + parseFloat(entry.hours);
                }

                for (let day in resume) {
                    days.push({day: day, hours: resume[day]});
                }

            } else {
                for (let entry of loggedTime.time_entries) {
                    let issue;
                    if (!issues[entry.issue.id]) {
                        issues[entry.issue.id] = redmine.getIssue(entry.issue.id, {});
                    }
                    issue = issues[entry.issue.id];
                    days.push({day: entry.spent_on, issue: issue.issue, hours: entry.hours});
                }
            }
            filters.offset += loggedTime.limit;
            loggedTime = redmine.getLoggedTime(filters);
        }

        days.sort(((a, b) => {
            if (a.day < b.day) {
                return -1;
            }
            if (a.day > b.day) {
                return 1;
            }
            return 0;
        }));
        if (options.groupBy) {
            printer.printLoggedtimeResume(days);
        } else {
            printer.printLoggedtime(days);
        }
    } catch (err) {
        console.error(err)
    }
}
