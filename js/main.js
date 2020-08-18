
var notes = [];
var notesDOM = [];
var textArea;
var currentNote;
var currentNoteDOM;
var simpleMDE;
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

function deleteNote(idx)
{
    if(confirm("Cancellare la nota?"))
    {
        notes.splice(idx, 1);
        var DOM = notesDOM[idx];
        if(DOM)
            DOM.parentElement.removeChild(DOM);
        notesDOM.splice(idx, 1);
        save();
    }
}

function openNote (idx){
    console.log(idx); 
    if(currentNoteDOM)
        currentNoteDOM.classList.remove("note-selected");

    currentNote = notes[idx];
    currentNoteDOM = notesDOM[idx];  
    currentNoteDOM.classList.add("note-selected");  
    currentNoteDOMTitle = currentNoteDOM.getElementsByClassName("note-title")[0];
    currentNoteDOMContent = currentNoteDOM.getElementsByClassName("note-content")[0];
    if(currentNote)
    {
        titleInput.value = currentNote.title;
        simpleMDE.value(currentNote.content);
    }
    else
        console.error("Can't find note ", idx);
}
 
//create note document element
function createNoteDOM(title, content)
{
     var div = document.createElement("div");
     div.classList.add("note");
     var noteId = notes.length;
     console.log(noteId);
     div.onclick = function(){var id = noteId; openNote(id);}
     div.innerHTML = '<div class="note-title">'+title+'</div><div class="note-delete">x</div><div class="note-content">'+content+'</div>';
     div.getElementsByClassName("note-delete")[0].onclick = function(){var id = noteId; deleteNote(id);}
     return div;
}

function addNote(title, content)
{
    //create element
    var div = createNoteDOM(title, content);
    currentNoteDOMTitle = div.getElementsByClassName("note-title")[0];
    currentNoteDOMContent = div.getElementsByClassName("note-content")[0];
    
    //add element to the dom list
    var list =  document.getElementsByClassName("note-list")[0];
    list.prepend(div);

    //add element to list
    notesDOM.push(div); 
    notes.push({title:title, content:content});
    return notes.length - 1;
}

function add() {
    var d = new Date();
    var title = "Note " + d.getFullYear() + "-" + d.getMonth().pad(2) + "-" + d.getDay().pad(2) +
        " " + d.getHours().pad(2) + ":" +  d.getMinutes().pad(2);

    var noteId = addNote(title, "");

    //open the new note
    openNote(noteId);
    titleInput.focus();
    titleInput.select();
}


function load() {
    storeGet("tnotes", function(result){
        if(result)
        {
            console.log(result);
            notes = [];
            var n = JSON.parse(result.tnotes);
            n.forEach(element => {
                console.log(element);
                addNote(element.title, element.content);
            });
        } 
        add();
    });
}

function save() {
    var toSave = [];
    for(var i = 0; i < notes.length; i++)
        if(notes[i].content != "")
            toSave.push(notes[i]);

    storeSet("tnotes", JSON.stringify(toSave), ()=>{console.log("saved")});
}

function writeTitle() {
    if(currentNote)
    {
        currentNote.title = titleInput.value;
        currentNoteDOMTitle.innerHTML = currentNote.title;
    }
    save();
}

function writeContent() {
    if(currentNote)
    {
        currentNote.content = simpleMDE.value();
        currentNoteDOMTitle.innerHTML = currentNote.title;
        currentNoteDOMContent.innerHTML = currentNote.content;
    }
    save();
}

window.addEventListener("load", function(){
    console.log("loaded")
    textArea = document.getElementById("md");
    titleInput =  document.getElementById("input-title");
    simpleMDE = new SimpleMDE({
        element: textArea,
        spellChecker: false,
	    toolbar: false,
    });

    
    simpleMDE.codemirror.on("change", function(){
        writeContent();
    });

    load();
    

    document.getElementById("add-note").onclick = add;
    document.getElementById("input-title").onchange = writeTitle;
});


function storeGet(key, callback)
{

    if(window.localStorage)
        callback({[key]:window.localStorage.getItem(key)});
    else if(chrome && chrome.storage && chrome.storage.local)
        return chrome.storage.local.get([key], callback);
}

function storeSet(key, value, callback)
{
    if(window.localStorage)
         window.localStorage.setItem(key, value);
    else if(chrome && chrome.storage && chrome.storage.local)
        chrome.storage.local.set({[key]:value}, callback);
}