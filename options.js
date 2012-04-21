document.addEventListener('DOMContentLoaded', function () {
    document.timesink_urls = load_settings('timesink_urls');
    restore_settings();
    document.getElementById("new-url").addEventListener('click', save_new_url);
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
        del_cell.innerHTML = '<button class="btn-danger"><strong>x</strong></button>';
        var del_button = del_cell.firstChild;
        del_button.addEventListener('click', function() {delete_url(this)});
        //var onclick_string = 'delete_url("' + new_url + '")';
        //del_button.setAttribute('onclick', onclick_string);

        save_settings('timesink_urls', document.timesink_urls);
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
}

function save_settings (name, setting) {
    var stringified_settings = JSON.stringify(setting);
    localStorage.setItem(name, stringified_settings);

}

function load_settings (name) {
    if (localStorage.length === 0)
        return {};
    var stringified_settings = localStorage[name];
    var setting = JSON.parse(stringified_settings);
    return setting;
}

function restore_settings () {
           
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
        del_cell.innerHTML = '<button class="btn-danger"><strong>x</strong></button>';
        var del_button = del_cell.firstChild;
        del_button.addEventListener('click', function() {delete_url(this)});
        //var onclick_string = 'delete_url("' + url + '")';
        //del_button.setAttribute('onclick', onclick_string);
        
    }
}


