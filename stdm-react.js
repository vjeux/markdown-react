// Basic usage:
//
// var stmd = require('stmd');
// var parser = new stmd.DocParser();
// var renderer = new stmdReact.ReactRenderer();
// console.log(renderer.render(parser.parse('Hello *world*')));

(function(exports) {

// Helper function to produce content in a pair of HTML tags.
var inTags = function(tag, attribs, contents, selfclosing) {
  var props = {};
  if (attribs) {
    var i = 0;
    var attrib;
    while ((attrib = attribs[i]) !== undefined) {
      props[attrib[0]] = attrib[1];
      i++;
    }
  }

  return React.DOM[tag](props, contents);
};

// Render an inline element as HTML.
var renderInline = function(inline) {
  var attrs;
  switch (inline.t) {
    case 'Str':
      return this.escape(inline.c);
    case 'Softbreak':
      return this.softbreak;
    case 'Hardbreak':
      return [inTags('br',[],null,true), '\n'];
    case 'Emph':
      return inTags('em', [], this.renderInlines(inline.c));
    case 'Strong':
      return inTags('strong', [], this.renderInlines(inline.c));
    case 'Html':
      return inline.c;
    case 'Entity':
      return inline.c;
    case 'Link':
      attrs = [['href', this.escape(inline.destination, true)]];
      if (inline.title) {
        attrs.push(['title', this.escape(inline.title, true)]);
      }
      return inTags('a', attrs, this.renderInlines(inline.label));
    case 'Image':
      attrs = [['src', this.escape(inline.destination, true)],
                   ['alt', this.escape(this.renderInlines(inline.label))]];
      if (inline.title) {
        attrs.push(['title', this.escape(inline.title, true)]);
      }
      return inTags('img', attrs, null, true);
    case 'Code':
      return inTags('code', [], this.escape(inline.c));
    default:
      console.log("Uknown inline type " + inline.t);
      return null;
  }
};

// Render a list of inlines.
var renderInlines = function(inlines) {
  var result = [];
  for (var i=0; i < inlines.length; i++) {
    result.push(this.renderInline(inlines[i]));
  }
  return result;
};

// Render a single block element.
var renderBlock = function(block, in_tight_list) {
  var tag;
  var attr;
  var info_words;
  switch (block.t) {
    case 'Document':
      var whole_doc = this.renderBlocks(block.children);
      return (whole_doc === '' ? null : [whole_doc, '\n']);
    case 'Paragraph':
      if (in_tight_list) {
        return this.renderInlines(block.inline_content);
      } else {
        return inTags('p', [], this.renderInlines(block.inline_content));;
      }
      break;
    case 'BlockQuote':
      var filling = this.renderBlocks(block.children);
      return inTags('blockquote', [], filling === '' ? this.innersep :
          [this.innersep, this.renderBlocks(block.children), this.innersep]);
    case 'ListItem':
      return inTags('li', [], this.renderBlocks(block.children, in_tight_list));//.trim());
    case 'List':
      tag = block.list_data.type == 'Bullet' ? 'ul' : 'ol';
      attr = (!block.list_data.start || block.list_data.start == 1) ?
              [] : [['start', block.list_data.start.toString()]];
      return inTags(tag, attr, [this.innersep,
                    this.renderBlocks(block.children, block.tight),
                    this.innersep]);
    case 'ATXHeader':
    case 'SetextHeader':
      tag = 'h' + block.level;
      return inTags(tag, [], this.renderInlines(block.inline_content));
    case 'IndentedCode':
      return inTags('pre', [],
              inTags('code', [], this.escape(block.string_content)));
    case 'FencedCode':
      info_words = block.info.split(/ +/);
      attr = info_words.length === 0 || info_words[0].length === 0 ?
                   [] : [['class',this.escape(info_words[0],true)]];
      return inTags('pre', attr,
              inTags('code', [], this.escape(block.string_content)));
    case 'HtmlBlock':
      return block.string_content;
    case 'ReferenceDef':
      return null;
    case 'HorizontalRule':
      return inTags('hr',[],null,true);
    default:
      console.log("Uknown block type " + block.t);
      return null;
  }
};

// Render a list of block elements, separated by this.blocksep.
var renderBlocks = function(blocks, in_tight_list) {
  var result = [];
  for (var i=0; i < blocks.length; i++) {
    if (blocks[i].t !== 'ReferenceDef') {
      result.push(this.renderBlock(blocks[i], in_tight_list));
      if (i !== blocks.length - 1) {
        result.push(this.blocksep);
      }
    }
  }
  return result;
};

// The ReactRenderer object.
function ReactRenderer(){
  return {
    // default options:
    blocksep: '\n',  // space between blocks
    innersep: '\n',  // space between block container tag and contents
    softbreak: '\n', // by default, soft breaks are rendered as newlines in HTML
                     // set to "<br />" to make them hard breaks
                     // set to " " if you want to ignore line wrapping in source
    escape: function(s, preserve_entities) {
      return s;
    },
    renderInline: renderInline,
    renderInlines: renderInlines,
    renderBlock: renderBlock,
    renderBlocks: renderBlocks,
    render: renderBlock
  };
}

exports.ReactRenderer = ReactRenderer;

})(typeof exports === 'undefined' ? this.stmdReact = {} : exports);
