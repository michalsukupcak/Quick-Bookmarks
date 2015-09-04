var ID_BACK_BUTTON = 'backButton';
var ID_EDIT_BUTTON = 'editButton';
var ID_CLOSE_BUTTON = 'closeButton';
var ID_CONTENT = 'content';
var ID_APP_TITLE = 'appTitle';
var STORAGE_FOLDER_ID = 'quick-bookmarks-folder-id';

(function (document) {
    'use strict';

    var app = {

        /**
         * ID of currently used folder.
         */
        folderId: 0,

        /**
         * Initialize application
         */
        init: function() {
            this.setGlobalEventListeners();
            this.loadFoldersAndLinks();
            this.setUIElements();
        },

        /**
         * Sets event listeners for back, edit and close buttons.
         */
        setGlobalEventListeners: function () {
            document.getElementById(ID_BACK_BUTTON).addEventListener('click', function () {
                chrome.bookmarks.get(this.folderId, function (entry) {
                    this.openFolder(entry[0].parentId);
                }.bind(this));
            }.bind(this));
            document.getElementById(ID_EDIT_BUTTON).addEventListener('click', function () {
                chrome.tabs.create({
                    url: 'chrome://bookmarks/#' + this.folderId
                });
            }.bind(this));
            document.getElementById(ID_CLOSE_BUTTON).addEventListener('click', function () {
                window.close();
            });
        },

        /**
         * Loads current folder and link structure (either continue from localStorage, or generate new default data).
         */
        loadFoldersAndLinks: function () {
            var folderId = window.localStorage.getItem(STORAGE_FOLDER_ID);
            if (!folderId) {
                chrome.bookmarks.getTree(function (bookmarks) {
                    var content = document.getElementById(ID_CONTENT);
                    var topLevel = bookmarks[0].children;
                    for (var i = 0; i < topLevel.length; i++) {
                        content.appendChild(this.createFolder(topLevel[i]));
                    }
                }.bind(this));
            } else {
                this.folderId = folderId;
                this.openFolder(this.folderId);
            }
        },

        /**
         * Sets UI elements visibility.
         */
        setUIElements: function () {
            if (this.folderId == 0) {
                document.getElementById(ID_BACK_BUTTON).style.display = 'none';
                document.getElementById(ID_EDIT_BUTTON).style.display = 'none';
            } else {
                document.getElementById(ID_BACK_BUTTON).style.display = 'inline-block';
                document.getElementById(ID_EDIT_BUTTON).style.display = 'inline';
            }
        },

        createFolder: function (folder) {
            var a = document.createElement('a');
            var faviconDiv = document.createElement('div');
            var faviconImg = document.createElement('img');
            var titleDiv = document.createElement('div');
            var clearDiv = document.createElement('div');
            faviconImg.setAttribute('src', './images/folder.png');
            faviconDiv.setAttribute('class', 'favicon');
            faviconDiv.appendChild(faviconImg);
            titleDiv.setAttribute('class', 'title');
            titleDiv.appendChild(document.createTextNode(folder.title));
            clearDiv.setAttribute('class', 'clear');
            a.addEventListener('click', function () { this.openFolder(folder.id); }.bind(this));
            a.appendChild(faviconDiv);
            a.appendChild(titleDiv);
            a.appendChild(clearDiv);
            return a;
        },

        createLink: function (link) {
            var a = document.createElement('a');
            var faviconDiv = document.createElement('div');
            var faviconImg = document.createElement('img');
            var titleDiv = document.createElement('div');
            var clearDiv = document.createElement('div');
            faviconImg.setAttribute('src', 'chrome://favicon/' + link.url);
            faviconDiv.setAttribute('class', 'favicon');
            faviconDiv.appendChild(faviconImg);
            titleDiv.setAttribute('class', 'title');
            titleDiv.appendChild(document.createTextNode(link.title));
            clearDiv.setAttribute('class', 'clear');
            a.setAttribute('href', link.url);
            a.setAttribute('target', '_blank');
            a.appendChild(faviconDiv);
            a.appendChild(titleDiv);
            a.appendChild(clearDiv);
            return a;
        },

        openFolder: function (folderId) {
            this.folderId = folderId;
            var content = document.getElementById(ID_CONTENT);
            var folders = [];
            var links = [];
            chrome.bookmarks.get(folderId, function (entry) {
                if (entry[0].title) {
                    document.getElementById(ID_APP_TITLE).innerHTML = entry[0].title;
                } else {
                    document.getElementById(ID_APP_TITLE).innerHTML = 'Chrome Bookmarks';
                }
            });
            chrome.bookmarks.getChildren(folderId, function (children) {
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    if (child.url == null) {
                        folders.push(child);
                    } else {
                        links.push(child);
                    }
                }
                this.clearContent();
                for (var i = 0; i < links.length; i++) {
                    content.appendChild(this.createLink(links[i]));
                }
                if (links.length > 0 && folders.length > 0) {
                    content.appendChild(document.createElement('hr'));
                }
                for (var i = 0; i < folders.length; i++) {
                    content.appendChild(this.createFolder(folders[i]));
                }
                this.setUIElements();
                window.localStorage.setItem(STORAGE_FOLDER_ID, this.folderId);
            }.bind(this));
        },

        clearContent: function () {
            var content = document.getElementById('content');
            while (content.firstChild) {
                content.removeChild(content.firstChild);
            }
        },

    };

    app.init();

})(document);
