// Userlist data array for filling in info box
var userListData = [];
var userSelected;

// DOM Ready ==========================================
$(document).ready(function () {
    // Initialize whether a user has been examined/clicked
    userSelected = false;

    // Populate user table on initial page load
    populateTable();

    // Catch username get info clicks
    $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);

    // Catch add user button clicks
    $('#btnAddUser').on('click', addUser);

    // Catch delete user button clicks
    $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

// Functions ==========================================

// Fill table with data
function populateTable() {
    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON('users/userlist', function (data) {
        // Store user data into global variable
        userListData = data;

        // For each table in the JSON add a table row and cells
        $.each(data, function() {
            tableContent += '<tr>'
            tableContent += '<td><a href="#" class="linkshowuser" rel="' + this.username + '" title="Show Details">' + this.username + '</a></td>';
            tableContent += '<td>' + this.email + '</td>';
            tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the content string into existing HTML table
        $('#userList table tbody').html(tableContent);

    });
};

// Show user info
function showUserInfo(event) {
    // Prevent link from firing
    event.preventDefault();

    // Retrieve username from link rel attribute
    var thisUserName = $(this).attr('rel');

    // Get index of object based on id value
    var arrayPosition = userListData.map(function(arrayItem) { return arrayItem.username; }).indexOf(thisUserName);

    // Get our user object
    var thisUserObject = userListData[arrayPosition];

    // Populate info box
    $('#userInfoName').text(thisUserObject.fullname);
    $('#userInfoAge').text(thisUserObject.age);
    $('#userInfoGender').text(thisUserObject.gender);
    $('#userInfoLocation').text(thisUserObject.location);

    userSelected = true;

    // Switch state to editing
    $('#addUserTitle').text('Edit User');
    $('#btnAddUser').text('Edit User');
    if($('#cancelButton').length == 0) {
        $('#btnAddUser').after('<button id="cancelButton">Cancel</button>')

        $('#cancelButton').on('click', function() {
            // Change titles to Add
            $('#addUserTitle').text('Add User');
            $('#btnAddUser').text('Add User');

            // Clear user info table
            $('#userInfoName').text('');
            $('#userInfoAge').text('');
            $('#userInfoGender').text('');
            $('#userInfoLocation').text('');

            userSelected = false;
            this.remove();
        })
    }
};

// Add userListData
function addUser(event) {
    // Prevent link from firing
    event.preventDefault();

    // Basic validation - increase errorCount if any fields are blank
    var errorCount = 0;
    $('#addUser input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    // Start if errorCount is still 0
    if(errorCount == 0) {

        // Compile use info into single object
        var newUser = {
            'username': $('#addUser fieldset input#inputUserName').val(),
            'email': $('#addUser fieldset input#inputUserEmail').val(),
            'fullname': $('#addUser fieldset input#inputUserFullname').val(),
            'age': $('#addUser fieldset input#inputUserAge').val(),
            'location': $('#addUser fieldset input#inputUserLocation').val(),
            'gender': $('#addUser fieldset input#inputUserGender').val()
        }

        // Use AJAX to post object to adduser service
        $.ajax({
            type: 'POST',
            data: newUser,
            url: '/users/adduser',
            dataType: 'JSON'
        }).done(function(response) {

            // Check for successful blank response
            if(response.msg === '') {

                // Clear form inputs
                $('#addUser fieldset input').val('');

                // Update the table
                populateTable();

            } else {
                alert('Error: ' + response.msg);
            }

        });

    } else {
        alert('Please fill in all fields')
        return false;
    }
};
// Delete user from database
function deleteUser(event) {
    // Prevent link from firing
    event.preventDefault();

    // Show confirmation dialog
    var confirmation = confirm('Are you sure you\'d like to delete this user?');

    if(confirmation == true) {

        $.ajax({
            type: 'DELETE',
            url: '/users/deleteuser/' + $(this).attr('rel')
        }).done(function(response) {

            if(response.msg == '') {
            } else {
                alert('Error: ' + response.msg);
            }

            // update the table
            populateTable();

        });

    } else {
        return false;
    }
}