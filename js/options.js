function Settings () {
    this.timesink_urls;
    this.extra_settings;
    this.loaded = false;
}

var settings = new Settings;

document.addEventListener('DOMContentLoaded', function () {
    settings.timesink_urls = load_settings('timesink_urls');
    settings.extra_settings = load_settings('extra_settings');
    restore_settings();
    document.getElementById("new-url").addEventListener('click', save_new_url);
    document.getElementById("save-button").addEventListener('click', save_extra_settings);
    var options = chrome.extension.getURL("/html/options.html");
    document.getElementById("settings").addEventListener('click', function () { window.location = options; });
    var help = chrome.extension.getURL("/html/help.html");
    document.getElementById("help").addEventListener('click', function () { window.location = help; });
    var about = chrome.extension.getURL("/html/about.html");
    document.getElementById("about").addEventListener('click', function () { window.location = about; });
});

function save_new_url () {
    var url_field = document.getElementById("url-field");
    var new_url = url_field.value;
    //console.log(new_url);
    
    var time_field = document.getElementById("time-field");
    var new_time = time_field.value;
    var new_secs = new_time * 60;
    //console.log(new_secs);

    if (!(isNaN(new_secs)) && new_url !== '') {
        if (new_url in settings.timesink_urls === false) {
            settings.timesink_urls[new_url] = new_secs;
            //console.log(settings.timesink_urls);

            
            var url_list = document.getElementById("url-list");
            var add_url = document.getElementById("add-url");
            var new_li = document.createElement("li");
            url_list.insertBefore(new_li, add_url);
            new_li.setAttribute('id', new_url);
                
            var url_div = document.createElement("div");
            url_div.setAttribute("class", "span6");
            new_li.appendChild(url_div);

            var time_div = document.createElement("div");
            time_div.setAttribute("class", "span2");
            new_li.appendChild(time_div);

            var del_div = document.createElement("div");
            del_div.setAttribute("class", "span4");
            new_li.appendChild(del_div);

            var url_text = document.createTextNode(new_url);
            url_div.appendChild(url_text);

            var time_text = document.createTextNode(new_time);
            time_div.appendChild(time_text);
                
            var del_controls = '<button id="edit" class="link custom-appearance">Edit</button>\
                                <button class="trash custom-appearance" id="delete">\
                                <span class="lid"></span><span class="can"</span></button>';

            del_div.innerHTML = del_controls;

            var edit_link = del_div.firstChild;
            var editlistener = function() {edit_url(this)};
            edit_link.editlistener = editlistener;
            document.getElementById('edit').addEventListener('click', editlistener);        
               
            var del_button = edit_link.nextElementSibling;
            del_button.addEventListener('click', function() {delete_url(this)});

            save_settings('timesink_urls', settings.timesink_urls);
            //console.log(settings.timesink_urls);
        }
    }
}

function delete_url (element) {
    //console.log(element);
    var url = element.parentNode.parentNode.id;
    //console.log(url);
    var url_row = document.getElementById(url);
    url_row.parentNode.removeChild(url_row);  
    delete settings.timesink_urls[url];
    save_settings('timesink_urls', settings.timesink_urls);
    //console.log(settings.timesink_urls);
}

function edit_url (element) {
    //console.log("edit_url()");
    element.removeEventListener('click', element.editlistener, false);
    element.innerText = 'Save';
    element.setAttribute('id', 'save');
    var savelistener = function() {save_changed_url(this)};
    element.savelistener = savelistener;
    element.addEventListener('click', savelistener);
    var url = element.parentNode.parentNode.id;
    var url_li = document.getElementById(url);
    var url_div = url_li.firstChild;
    var time_div = url_div.nextSibling;
    var del_div = time_div.nextSibling;
    
    var placeholder = url_div.innerText;
    url_div.innerHTML = '<input id="edit-url-field" value="" type="text" class="span6"></input>';
    url_div.firstChild.value = placeholder;
    
    placeholder = time_div.innerText;
    time_div.innerHTML = '<input id="edit-time-field" value="" type="text" class="span2"></input>';
    time_div.firstChild.value = placeholder;
}

function save_changed_url (element) {
    //console.log("save_changed_url()");    
    var url_li = element.parentNode.parentNode;
    var url_div = url_li.firstChild;
    var time_div = url_div.nextSibling;
    var del_div = time_div.nextSibling;

    var url_field = url_div.firstChild;
    var new_url = url_field.value;
    
    var time_field = time_div.firstChild;
    var new_time = time_field.value;
    var new_secs = new_time * 60;

    if (!isNaN(new_time) 
        && new_time > 0
        && new_url !== '') {
    
        var old_url = url_li.id;
        delete settings.timesink_urls[old_url];
        settings.timesink_urls[new_url] = new_secs;
        
        url_li.id = new_url;

        url_field.parentNode.removeChild(url_field);
        url_div.innerHTML = new_url;
        
        time_field.parentNode.removeChild(time_field);
        time_div.innerHTML = new_time;

        var del_controls = '<button id="edit" class="link custom-appearance">Edit</button>\
                            <button class="trash custom-appearance" id="delete">\
                            <span class="lid"></span><span class="can"</span></button>';

        del_div.innerHTML = del_controls;
        
        var edit_link = del_div.firstChild;
        var editlistener = function() {edit_url(this)};
        edit_link.editlistener = editlistener;
        edit_link.addEventListener('click', editlistener);        
        
       
        var del_button = edit_link.nextElementSibling;
        del_button.addEventListener('click', function() {delete_url(this)});

        save_settings('timesink_urls', settings.timesink_urls);
        //console.log(settings.timesink_urls);
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

    if ('default_time' in settings.extra_settings === true) {
        var badge_checkbox = document.getElementById('show-badge');
        badge_checkbox.checked = settings.extra_settings['show_badge'];

        var default_time = document.getElementById('default-time');
        default_time.value = settings.extra_settings['default_time'];
    }
           
    var url_list = document.getElementById("url-list");
    var add_url = document.getElementById("add-url");
    for (var url in settings.timesink_urls) {
        var new_li = document.createElement("li");
        url_list.insertBefore(new_li, add_url);
        new_li.setAttribute('id', url);
        
        var url_div = document.createElement("div");
        url_div.setAttribute("class", "span6");
        new_li.appendChild(url_div);

        var time_div = document.createElement("div");
        time_div.setAttribute("class", "span2");
        new_li.appendChild(time_div);

        var del_div = document.createElement("div");
        del_div.setAttribute("class", "span4");
        new_li.appendChild(del_div);

        var url_text = document.createTextNode(url);
        url_div.appendChild(url_text);

        var time_mins = Math.round(settings.timesink_urls[url] / 60);
        var time_text = document.createTextNode(time_mins.toString());
        time_div.appendChild(time_text);
        
        var del_controls = '<button id="edit" class="link custom-appearance">Edit</button>\
                            <button class="trash custom-appearance" id="delete">\
                            <span class="lid"></span><span class="can"</span></button>';
        del_div.innerHTML = del_controls;

        var edit_link = del_div.firstChild;
        var editlistener = function() {edit_url(this)};
        edit_link.editlistener = editlistener;
        edit_link.addEventListener('click', editlistener);        
       
        var del_button = edit_link.nextElementSibling;
        del_button.addEventListener('click', function() {delete_url(this)});
    }
}

function save_extra_settings () {
    //console.log("save_extra_settings();");
    var default_time = document.getElementById('default-time').value
    if (!isNaN(default_time) 
        && default_time > 0) { 
        settings.extra_settings['default_time'] = default_time;
    }
    //console.log(document.getElementById('show-badge').checked);
    var show_badge = document.getElementById('show-badge').checked    
    settings.extra_settings['show_badge'] = show_badge;
    //console.log(settings.extra_settings);
    save_settings('extra_settings', settings.extra_settings);
    chrome.extension.sendRequest({update_settings: true});
}
