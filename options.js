document.addEventListener('DOMContentLoaded', function () {
    document.timesink_urls = load_settings('timesink_urls');
    document.extra_settings = load_settings('extra_settings');
    restore_settings();
    document.getElementById("new-url").addEventListener('click', save_new_url);
    document.getElementById("save-button").addEventListener('click', save_extra_settings);
});

function save_new_url () {
    var url_field = document.getElementById("url-field");
    var new_url = url_field.value;
    console.log(new_url);
    
    var time_field = document.getElementById("time-field");
    var new_time = time_field.value;
    var new_secs = new_time * 60;
    console.log(new_secs);

    if (new_secs !== isNaN(new_secs) && new_url !== '') {
        if (new_url in document.timesink_urls === false) {
            document.timesink_urls[new_url] = new_secs;
            console.log(document.timesink_urls);
                
            var url_table = document.getElementById("url-table");
            var new_row = url_table.insertRow(0);
            new_row.setAttribute('id', new_url);
            var url_cell = new_row.insertCell(0);
            var time_cell = new_row.insertCell(1);
            var del_cell = new_row.insertCell(2);
            var url_text = document.createTextNode(new_url);
            url_cell.appendChild(url_text);
            var time_text = document.createTextNode(new_time);
            time_cell.appendChild(time_text);
           
            del_cell.innerHTML = '<button class="btn" id="edit">Edit</button> <button class="btn-danger" id="delete"><strong>x</strong></button>';
        
            var edit_button = del_cell.firstChild;
            var editlistener = function() {edit_url(this)};
            edit_button.editlistener = editlistener;
            document.getElementById('edit').addEventListener('click', editlistener);        
        
       
            var del_button = edit_button.nextElementSibling;
            del_button.addEventListener('click', function() {delete_url(this)});

            save_settings('timesink_urls', document.timesink_urls);
            console.log(document.timesink_urls);
        }
    }

}

function delete_url (element) {
    console.log(element);
    var url = element.parentNode.parentNode.id;
    console.log(url);
    var url_row = document.getElementById(url);
    url_row.parentNode.removeChild(url_row);  
    delete document.timesink_urls[url];
    save_settings('timesink_urls', document.timesink_urls);
    console.log(document.timesink_urls);
}

function edit_url (element) {
    console.log("edit_url()");
    element.removeEventListener('click', element.editlistener, false);
    element.innerText = 'Save';
    element.setAttribute('id', 'save');
    element.addEventListener('click', function() {save_changed_url(this)});
    var url = element.parentNode.parentNode.id;
    var url_row = document.getElementById(url);
    var url_cell = url_row.firstChild;
    var time_cell = url_cell.nextSibling;
    var del_cell = time_cell.nextSibling;
    
    var placeholder = url_cell.innerText;
    url_cell.innerHTML = '<input id="edit-url-field" type="text" class="span4"></input>';
    url_cell.firstChild.value = placeholder;
    
    placeholder = time_cell.innerText;
    time_cell.innerHTML = '<input id="edit-time-field" type="text" class="span1"></input>';
    time_cell.firstChild.value = placeholder;

   
}

function save_changed_url (element) {
    console.log("save_changed_url()");    
    var url_row = element.parentNode.parentNode;
    var url_cell = url_row.firstChild;
    var time_cell = url_cell.nextSibling;
    var del_cell = time_cell.nextSibling;

    var url_field = url_cell.firstChild;
    var new_url = url_field.value;
    
    
    var time_field = time_cell.firstChild;
    var new_time = time_field.value;
    var new_secs = new_time * 60;
    console.log(time_field.value);

    if (new_secs !== isNaN(new_secs) && new_url !== '') {
    
        var old_url = url_row.id;
        delete document.timesink_urls[old_url];
        document.timesink_urls[new_url] = new_secs;
        
        url_row.id = new_url;

        url_field.parentNode.removeChild(url_field);
        url_cell.innerHTML = new_url;
        
        time_field.parentNode.removeChild(time_field);
        time_cell.innerHTML = new_time;

        del_cell.innerHTML = '<button class="btn" id="edit">Edit</button> <button class="btn-danger" id="delete"><strong>x</strong></button>';
        
        var edit_button = del_cell.firstChild;
        var editlistener = function() {edit_url(this)};
        edit_button.editlistener = editlistener;
        edit_button.addEventListener('click', editlistener);        
        
       
        var del_button = edit_button.nextElementSibling;
        del_button.addEventListener('click', function() {delete_url(this)});

        save_settings('timesink_urls', document.timesink_urls);
        console.log(document.timesink_urls);
    }
}

function save_settings (name, setting) {
    var stringified_settings = JSON.stringify(setting);
    localStorage.setItem(name, stringified_settings);

}

function load_settings (name) {
    if (localStorage.length === 0)
        return {};
    if (name in localStorage === false)
        return {};
    var stringified_settings = localStorage[name];
    var setting = JSON.parse(stringified_settings);
    return setting;
}

function restore_settings () {

    if ('default_time' in document.extra_settings === true) {

        var badge_checkbox = document.getElementById('show-badge');
        badge_checkbox.checked = document.extra_settings['show_badge'];

        var default_time = document.getElementById('default-time');
        default_time.value = document.extra_settings['default_time'];
    }
           
    var url_table = document.getElementById("url-table");
    for (var url in document.timesink_urls) {
        var new_row = url_table.insertRow(0);
        new_row.setAttribute('id', url);        
        var url_cell = new_row.insertCell(0);
        var time_cell = new_row.insertCell(1);
        var del_cell = new_row.insertCell(2);
        var url_text = document.createTextNode(url);
        url_cell.appendChild(url_text);
        var time_mins = Math.round(document.timesink_urls[url] / 60);
        var time_text = document.createTextNode(time_mins.toString());
        time_cell.appendChild(time_text);
        
        del_cell.innerHTML = '<button class="btn" id="edit">Edit</button> <button class="btn-danger" id="delete"><strong>x</strong></button>';
        
        var edit_button = del_cell.firstChild;
        var editlistener = function() {edit_url(this)};
        edit_button.editlistener = editlistener;
        document.getElementById('edit').addEventListener('click', editlistener);        
        
       
        var del_button = edit_button.nextElementSibling;
        del_button.addEventListener('click', function() {delete_url(this)});
        
        //var onclick_string = 'delete_url("' + url + '")';
        //del_button.setAttribute('onclick', onclick_string);
        
    }
}

function save_extra_settings () {
    console.log("save_extra_settings();");
    var default_time = document.getElementById('default-time').value
    var show_badge = document.getElementById('show-badge').checked
    document.extra_settings['default_time'] = default_time;
    document.extra_settings['show_badge'] = show_badge;
    console.log(document.extra_settings);
    save_settings('extra_settings', document.extra_settings);
    chrome.extension.sendRequest({update_settings: true});
}
