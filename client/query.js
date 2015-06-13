/*
  Changing these session variables will trigger ArticleDiv to re-render (in app.js)
  
*/  

query = function(type, params){
  Session.set("queryType", type)
  //console.log(type)
  if(type == "tag"){
    Session.set("queryTagId",  params.tag_id) 
    Session.set("queryTagText",  params.tagText) 
  
  } else if (type == "text"){
    Session.set("queryText",  params.queryText)
  
  } else if (type == "goal"){
    Session.set("queryGoalType",  params.queryGoalType)
    Session.set("queryGoalSubtype",  params.queryGoalSubtype)
  
  } else if (type == "all"){
    //no parameters
  }
}
