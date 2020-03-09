// Parser code used with Peg.JS online parser.
// Currently under construction.  Backing up in case my computer restarts
// Parts are heavily borrowed from https://gist.github.com/daffl/878d4b60eb45e3a19e2b
{
  // Borrowed from: https://stackoverflow.com/a/2631198/298149
  function getNested(obj, ...args){ 
      let nested = args.reduce((obj,level) => obj && obj[level],obj)
      if(!nested){
          throw new Error(`Path not found in context ${args.join('.')}`)
      }
      return nested;
  }
  
  // Borrowed from: https://stackoverflow.com/a/15030117/298149
  function flatten(arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
  }, []);
}
}

command
  = head: expr _ tail: (logical _ expr _)* { 
    console.log(head);
    if(tail.length === 0){
      return head;
    } else {
      var result = head;
      
      for(var i = 0; i < tail.length; i++){
        var filtered = flatten(tail[i]).filter( el => { return el && el !== ' ' } );
        console.log(filtered)
        if(filtered[0] === '||'){
          result = result || filtered[1];
        }
      }
      return result;
    }
    
  }
  
expr 
  = _ negate:(not)?_ lhs:object _ expr:expression _ rhs:object _ {
	var result = true;
    if(expr === '>'){
      result = lhs > rhs;
    } else if (expr === '>='){
      result = lhs >= rhs;
    } else if (expr === '<'){
      result = lhs < rhs;
    } else if (expr === '<='){
      result = lhs <= rhs;
    } else if(expr === '=='){ 
      result = lhs === rhs;
    } else if(expr === 'in'){ 
      result = rhs.indexOf(lhs) > -1;
    } else {
      throw new Error(`Unknown express ${expr}`)
    }
    if(negate){
      result = !result;
    }
    return result;
   }

object
  = path / string / array
  
logical
  = head: [|&]+ { return head.join('') }
not
  = [!]
path
  = head:word {
    return getNested(...[options.context].concat(head.split('.')));
  }
  
word = head:letter+ { return head.join(''); }
letter = head: [a-zA-Z0-9._] { return head; }// Note if we add the single quote here (and presumably double quotes)  then the expr will get broken as it tries to go down the path tree.  TODO: Open a bug


array
  = "[" _ head: string _ tail:([,] _ string _)* "]" { 
  return [head].concat(flatten(tail).filter(el => { return el && el !== ',' && el !== ' ' }));
  }
  
string "string" =
  doublequote text:(doublequote_character*) doublequote {
    return text.join('') ;
  } / singlequote text:(singlequote_character*) singlequote {
    return text.join('');
  }

doublequote_character =
  (!doublequote) c:character { return c; }

singlequote_character =
  (!singlequote) c:character { return c; }
  
doublequote "double quote" = '"'
singlequote "single quote" = "'"

character =
  unescaped
  / escape_sequence
  
unescaped = [\x20-\x21\x23-\x5B\x5D-\u10FFFF]

expression
  = head: [><=]+ { if(head.length >= 1) { return head.join('') } else { return head; }}
  / head: "in" { return "in"; }

_ "whitespace"
  = [ \t\n\r]*
  escape_character = "\\"
  HEXDIG = [0-9a-f]i
  escape_sequence "escape sequence" = escape_character sequence:(
     doublequote
   / singlequote
   / "\\"
   / "/"
   / "b" { return "\b"; }
   / "f" { return "\f"; }
   / "n" { return "\n"; }
   / "r" { return "\r"; }
   / "t" { return "\t"; }
   / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
       return String.fromCharCode(parseInt(digits, 16));
     }
  )
  { return sequence; }
