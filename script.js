let canvas = document.getElementsByTagName('canvas')[0];
let ctx = canvas.getContext('2d');

let x = 0; let y = 0;
let char_width = 12;
let char_height = 20;

let text = "Hello, world!\nThis is probably\nthe stupidiest\n  the most useless\n    thing\nI'VE\n  EVER\n    MADE\n\nEnjoy!";
let current_line_length = 7;
let lines_count = text.split("\n").length-1;

function redraw(){
 ctx.fillStyle = "#fff";  ctx.fillRect(0,0,canvas.getAttribute("width"),canvas.getAttribute("height"))
  ctx.fillStyle = "#000";
  redraw_text();
}

function insert_letter(letter){
  lines = text.split("\n")
  cur_line = lines[line_position].split("")
  cur_line.splice(char_position, 0, letter)
  lines[line_position] = ""
  cur_line.forEach(char => lines[line_position]+=char)
  let new_text = ""
  lines.forEach(line => new_text+=line+"\n")
  text = new_text.substring(0,new_text.length-1)
  redraw()
  redraw_marker()
}

function remove_letter(){
  lines = text.split("\n")
  cur_line = lines[line_position].split("")
  cur_line.splice(char_position-1, 1)
  lines[line_position] = ""
  cur_line.forEach(char => lines[line_position]+=char)
  let new_text = ""
  lines.forEach(line => new_text+=line+"\n")
  text = new_text.substring(0,new_text.length-1)
  redraw()
  redraw_marker()
}

function remove_line(){
  const regex = /(\n)/gm;
  newlines = []
  while ((m = regex.exec(text)) !== null) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }
    newlines.push(m.index)
  }
  lines = text.split("")
  lines.splice(newlines[line_position-1], 1);
  /*
  lines[line_position-1] = lines[line_position]
  cur_line.splice(char_position-1, 1)
  lines[line_position] = ""
  cur_line.forEach(char => lines[line_position]+=char)*/
  let new_text = ""
  lines.forEach(char => new_text+=char)
  text = new_text
  redraw()
  redraw_marker()
}

let line_length = [];
function redraw_text(){
  ctx.font = "20px monospace";
  y = 0;
  line_length = []
  text.split("\n").forEach(line => {
      ctx.fillText(line, x, y+20);
      line_length.push(line.length)
      y += char_height;
  });
}

let char_position = 13;
let line_position = 0;
document.addEventListener("keydown", e => {
  switch(e.key){
    case "ArrowLeft":
      marker_move(-1, 0);
      break;

    case "ArrowRight":
      marker_move(1, 0);
      break;

    case "ArrowUp":
      marker_move(0, -1);
      break;

    case "ArrowDown":
      marker_move(0, 1);
      break;

    case "Enter":
      insert_letter("\n");
      lines_count += 1
      char_position = 0;
      line_position += 1;
      marker_drawings();
      break;

    case "End":
      char_position = line_length[line_position-1];
      marker_drawings();
      break;

    case "Home":
      char_position = 0;
      marker_drawings();
      break;

    case "Backspace":
      if(char_position > 0){
        remove_letter();
        marker_move(-1,0)
      } else {
        if(line_position > 0){
          char_position = line_length[line_position-1];
          remove_line();
          line_position -= 1;
          lines_count -= 1;
          marker_drawings();
        }
      }
      break;

    default:
      key = e.key;
      if(/^.{2,}$/.test(key)){
        return;
        // special keys
      }
      if(!/^[a-zA-Z0-9!@#$%^&*\(\)?<>'\\\[\]"№%:,.;_+\-= ]{1}$/.test(key)){
        key = "?"
      }
      insert_letter(key);
      // I have no idea why when you type \n in page it does not add new line lol
      marker_move(1,0)
      break;
  }
});

marker_move(0,0);

function marker_move(by_x, by_y){
  current_line_length = line_length[line_position+by_y]
  if(char_position+by_x > current_line_length){
    if(line_position >= lines_count || by_y > 0) {
      char_position = line_length[line_position+by_y] - (by_x > 0 ? 1 : 0)
    } else {
      char_position = 0;
      line_position += 1;
      marker_drawings();
      return;
    }
  }
  if(line_position+by_y > lines_count){
    return;
  }
  if(char_position+by_x < 0){
    if(line_position == 0){
      return;
    } else {
      char_position = line_length[line_position-1];
      line_position -= 1;
      marker_drawings();
      return;
    }
  }
  if(line_position+by_y < 0){
    return;
  }
  char_position += by_x;
  line_position += by_y;
  marker_drawings();
}

function marker_drawings(){
  marker_x = char_position*char_width;
  marker_y = line_position*char_height;
  redraw();
  redraw_marker();
}

function redraw_marker(){
  ctx.fillRect(marker_x, marker_y, 1, char_height);
}

setInterval(function(){
  redraw_marker();
  setTimeout(function(){
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(marker_x, marker_y, 1, char_height);
    ctx.fillStyle = "#000";
  }, 1000);
},2000);

let selection_start_line = 0;
let selection_start_char = 0;
let selection_start_clientX = 0;
let selection_enabled = false;
canvas.addEventListener("mousedown", e => {
  canvasX = canvas.getBoundingClientRect().left;
  canvasY = canvas.getBoundingClientRect().top;
  selection_start_line = Math.round((e.clientY-canvasY)/char_height)
  selection_start_char = Math.round((e.clientX-canvasX)/char_width)
  if(selection_start_char > line_length[selection_start_line-1]){
    selection_start_char = line_length[selection_start_line-1]
  }
  selection_enabled = true
  redraw();
});
canvas.addEventListener("mouseup", e => {
  selection_enabled = false
})
canvas.addEventListener("mousemove", e => {
  if(selection_enabled){
    redraw();
    ctx.fillStyle = 'rgba(0,0,255,0.2)';
    chars_selected = Math.round((e.clientX-canvasX)/char_width)-selection_start_char;
    max_selection = line_length[selection_start_line-1]-selection_start_char;
    if(chars_selected > max_selection){
      chars_selected = max_selection
    }
    console.log(chars_selected)
    ctx.fillRect((selection_start_char)*char_width,
                 (selection_start_line-1)*char_height,
                 chars_selected*char_width,
                 char_height)
    ctx.fillStyle = '#000';
  }
})

function cleanthismess(){
  text = "";
  char_position = 0;
  line_position = 0;
  current_line_length = 7;
  lines_count = text.split("\n").length-1;
  marker_move(0,0)
  redraw();
  redraw_marker();
  document.getElementById("mrfocus").focus();
}
