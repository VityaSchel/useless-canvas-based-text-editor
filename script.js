let canvas = document.getElementsByTagName('canvas')[0];
let ctx = canvas.getContext('2d');

let field_bg = "#ffffff";
let text_color = "#000000";
let allow_any_chars = false;

let x = 0; let y = 0;
let render_x = 0; let render_y = 0;
let marker_x = 0; let marker_y = 0;
let char_width = 12;
let char_height = 20;

let text = "Hello, world!\nThis is probably\nthe stupidiest\n  the most useless\n    thing\nI'VE\n  EVER\n    MADE\n\nEnjoy!";
let current_line_length = 7;
let lines_count = text.split("\n").length-1;

function redraw(){
 ctx.fillStyle = field_bg;  ctx.fillRect(0,0,canvas.getAttribute("width"),canvas.getAttribute("height"))
  ctx.fillStyle = text_color;
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
  let new_text = ""
  lines.forEach(char => new_text+=char)
  text = new_text
  redraw()
  redraw_marker()
}

let line_length = [];
let marker_offset_x = 0;
function redraw_text(){
  ctx.font = "20px CourCyr";
  y = -render_y;
  line_length = []
  y_pseudo_lines_offset = 0
  rendering_line_index = 0
  text.split("\n").forEach(line => {
    let chars_in_line = line.length;
    let line_width = chars_in_line*char_width;
    let canvas_width = canvas.getBoundingClientRect().width;
    if(line_width <= canvas_width || line_position != rendering_line_index){
      ctx.fillText(line, x, y+20);
    } else {
      let max_chars_in_line = Math.floor(canvas_width / char_width)
      let screen_x = Math.floor(char_position / max_chars_in_line)
      let sub_start = screen_x*max_chars_in_line
      marker_offset_x = screen_x*max_chars_in_line*char_width;
      let sub_end = (screen_x+1)*max_chars_in_line
      ctx.fillText(line.substring(sub_start, sub_end), x, y+20);
    }
    line_length.push(chars_in_line)
    y += char_height;
    rendering_line_index += 1
  });
}

redrew_in_this_frame = false
setInterval(() => { redrew_in_this_frame = false }, 20);

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
      marker_move_window(0, 1)
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
      if(!/^[a-zA-Z0-9а-яА-Я!@#$%^&*\(\)?{}<>'\\\[\]"№%:,.;_+\-= ]{1}$/.test(key) && !allow_any_chars){
        key = "?"
      }
      insert_letter(key);
      // I have no idea why when you type \n in page it does not add new line lol
      marker_move(1,0)
      break;
  }
});

let width_block = document.getElementById("font-loaded").getBoundingClientRect().width;
let fontLoaded = setInterval(() => {
  if(document.getElementById("font-loaded").getBoundingClientRect().width != width_block){
    clearInterval(fontLoaded);
    marker_move(0,0);
  }
}, 10);

function marker_move(by_x, by_y){
  current_line_length = line_length[line_position+by_y]
  if(char_position+by_x > current_line_length){
    if(line_position >= lines_count || by_y != 0) {
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
  marker_move_window(by_x, by_y);
  marker_drawings();
}

function marker_move_window(by_x, by_y){
  let canvas_height = canvas.getBoundingClientRect().height;
  let marker_y_render_max = (line_position+1)*char_height;
  let marker_y_render_min = line_position*char_height;;
  if(marker_y_render_max-render_y > canvas_height){
     render_y += char_height
  } else if(marker_y_render_min < render_y){
     render_y -= char_height
  }
}

function marker_drawings(){
  marker_x = char_position*char_width;
  marker_y = line_position*char_height;
  marker_y -= render_y;
  redraw();
  redraw_marker();
}

function redraw_marker(){
  ctx.fillRect(marker_x-marker_offset_x, marker_y, 1, char_height);
}

setInterval(function(){
  redraw_marker();
  setTimeout(function(){
    ctx.fillStyle = field_bg;
    ctx.fillRect(marker_x-marker_offset_x, marker_y, 1, char_height);
    ctx.fillStyle = text_color;
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
  current_line_length = 0;
  marker_offset_x = 0;
  render_y = 0;
  lines_count = text.split("\n").length-1;
  marker_move(0,0)
  redraw();
  redraw_marker();
  document.getElementById("mrfocus").focus();
}
