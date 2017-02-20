
lunr_index = null;
pages_cache = {};
titles_cache = {};
var load_search_index = function(callback) {
  $.getJSON("texts/lunr_index.json", function(index){ lunr_index = lunr.Index.load(index); callback();});
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

var title2Id = function(title){
  return title.replaceAll(' ','_').replace(',','_').replace('\(','_').replace('\)','_').replace('\&','_');
}

var loadIDtoPage = function(callback){
  $.getJSON("texts/index.json", function(index){ 
           console.log(index);
           for(counter in index.texts){
             title=index.texts[counter].split(".txt")[0];
             titles_cache[title2Id(title)]=title;
           }
           callback();
    });
}

var renderResultList = function(results, search_query){
  $('#articles-container').empty();
  for(counter in results){
      title=results[counter].ref.split(".txt")[0];
      id=title2Id(title);
      var element = document.createElement('div');
      element.setAttribute('id',id);  
      element.setAttribute('class',"article-preview");      
      $('#articles-container').append(element);

      if(!pages_cache[id]) {
        $.get(encodeURIComponent('texts/html/'+title+'.html'), 
         (function(id, title){
          return function (data) {
            pages_cache[id]=data;  
            oncl="show_article(\""+encodeURIComponent(title)+"\", \""+encodeURIComponent(search_query)+"\");";
            $('#'+id)[0].innerHTML="<h1><a href='#"+id+"' onclick='"+oncl+"'>"+title+"</a></h1></br>"+pages_cache[id];
          };})(id, title, search_query) );
      } else {
            oncl="show_article(\""+encodeURIComponent(title)+"\", \""+encodeURIComponent(search_query)+"\");";
        $('#'+id)[0].innerHTML="<h1><a href='#"+id+"' onclick='"+oncl+"'>"+title+"</a></h1></br>"+pages_cache[id];
      }
       
  }
}

var show_article = function(title, search_query) {
  title = decodeURIComponent(title);
  search_query = decodeURIComponent(search_query);
  //console.log(window.location.hash, '#'+encodeURIComponent(title))
  $('#articles-container').empty();
  id=title2Id(title);
  var element = document.createElement('div');
  element.setAttribute('id',id);  
  element.setAttribute('class',"article");
  $('#articles-container').append(element);
  if(!pages_cache[id]) {
        $.get(encodeURIComponent('texts/html/'+title+'.html'), 
         (function(id, title){
          return function (data) {
            pages_cache[id]=data;  
            $('#'+id)[0].innerHTML="<h1><a href='#"+id+"' onclick='show_article("+encodeURIComponent(title)+")'>"+title+"</a></h1></br>"+pages_cache[id];  
            if(search_query)
               $('#'+id)[0].innerHTML=$('#'+id)[0].innerHTML+"<h1><a href='#q="+search_query+"' onclick='show_search(\""+encodeURIComponent(search_query)+"\")'>Назад</a></h1>";
          };})(id, title, search_query) );
   } else {
        $('#'+id)[0].innerHTML="<h1><a href='#"+id+"' onclick='show_article("+encodeURIComponent(title)+")'>"+title+"</a></h1></br>"+pages_cache[id];
        if(search_query)
               $('#'+id)[0].innerHTML=$('#'+id)[0].innerHTML+"<h1><a href='#q="+search_query+"' onclick='show_search(\""+encodeURIComponent(search_query)+"\")'>Назад</a></h1>";
  
   }
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

var show_search = function(search_query) {
  search_query = decodeURIComponent(search_query);
  console.log(search_query)
  if(search_query=="undefined"){
    show_list_of_pages();
    return;
  }
  window.location.hash='#q='+search_query;
  var results = lunr_index.search(search_query);
  renderResultList(results, search_query);
  document.body.scrollTop = document.documentElement.scrollTop = 0;
}

var show_list_of_pages = function() {
  $('#articles-container').empty();
  var element = document.createElement('ul');
  element.setAttribute('id','list_of_articles');  
  element.setAttribute('class',"article");
  for(key in titles_cache){
      var li = document.createElement('li');
      var lia = document.createElement('a');
      lia.href='#'+key;
      lia.onclick = show_article.bind(null,encodeURIComponent(titles_cache[key]));
      lia.innerHTML=titles_cache[key];
      li.append(lia);
      element.append(li);
  }
  $('#articles-container').append(element);
}

var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

var bind_search = function() {
 $('input').bind('keyup', function () {
    delay( function() {
      if ($('input').val() < 5) return
      var query = $('input').val()
      show_search(encodeURIComponent(query));
      },500);
  });
}

var load_from_page_href = function() {
  if(window.location.hash){
    
    if(window.location.hash.slice(0,3)=="#q=")
      show_search(encodeURIComponent(window.location.hash.slice(3)));
    else {
      id=window.location.hash.slice(1);
      title = titles_cache[id];
      show_article(encodeURIComponent(title));
     }

  }
  else {
      show_list_of_pages();
  }
}

window.onload = function(){
  loadIDtoPage(function(){ load_search_index(load_from_page_href);} );
  
  bind_search();
  

}
