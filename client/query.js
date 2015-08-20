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

tagQuery = function(queryTagId, queryTagText){
  var selectedArticleVoices = {}
  
  var allTagApplications = TagApplications.find({tag_id: queryTagId}).fetch()
  var articleIds = _.unique(_.pluck(allTagApplications, "article_id"))
  articles = Articles.find({_id: { $in: articleIds }}).fetch()  
  console.log("tag query: "+queryTagText)  
        
  _.each(allTagApplications, function(tagApplicationObj){
    var article_id = tagApplicationObj.article_id
    var field = tagApplicationObj.field
    if(selectedArticleVoices.hasOwnProperty(article_id)){
      selectedArticleVoices[article_id].push(field)
    }else{
      selectedArticleVoices[article_id] = [field] 
    }        
  })
  return [articles, selectedArticleVoices]   
}

notGoalQuery = function(){
  //var articles = []
  var selectedArticleVoices = {}  
  
  var query = {$and: [
      {"likert_two_stories_counts.yes": 0},
      {"likert_two_stories_counts.kinda": 0},
    ]}  

  
  var voicesObjs = Voices.find(query).fetch()
  var article_id_set = _.pluck(voicesObjs, "article_id")
  
  /*
  //make ranking function
  article_id_set_scores = {}
  //instantiate the scores to zero
  _.each(article_id_set, function(article_id){
    article_id_set_scores[article_id] = 0
  })
  _.each(voicesObjs, function(voiceObj){
    var article_id = voiceObj.article_id
    var score_inc = 0
    //based on the subquery, increment the score:
    if (queryGoalSubtype == "yes"){
      score_inc += voiceObj.likert_two_stories_counts.yes
    }
    if (queryGoalSubtype == "no"){
      score_inc += voiceObj.likert_two_stories_counts.no
    }
    if (queryGoalSubtype == "kinda"){
      score_inc += voiceObj.likert_two_stories_counts.kinda
    }
    if (queryGoalSubtype == "notDone"){
      //do nothing, they are all equally notDone
    }          
    
    article_id_set_scores[article_id] = article_id_set_scores[article_id] + score_inc
  })   */    
  var articleIds = _.unique(article_id_set)
  var articles_query = { _id: { $in: articleIds } }
  articles = Articles.find(articles_query).fetch()
  
  //SORT BY MOST YES / NO / KINDA
  //articles = _.sortBy(articles, function(article){  return article_id_set_scores[article._id] * -1 })
  
  
  _.each(voicesObjs, function(voicesObj){
    var article_id = voicesObj.article_id
    var voice = voicesObj.voice_number
    if(selectedArticleVoices.hasOwnProperty(article_id)){
      selectedArticleVoices[article_id].push(voice)
    }else{
      selectedArticleVoices[article_id] = [voice] 
    }        
  })
 
  return [articles, selectedArticleVoices]
}


notQuery = function(oldArticles, oldSelectedArticleVoices){
  var articles = []
  var selectedArticleVoices = {}
  
  var allArticles = Articles.find().fetch() 
  _.each(allArticles, function(article){
    var article_id = article._id
    
    //if oldSelectedArticleVoices has an entry for this article_id, we need to decide what to put in the new article, selectedVoice
    if (oldSelectedArticleVoices.hasOwnProperty(article_id)){
      oldArticleVoices = oldSelectedArticleVoices[article_id] 
      
      if(_.contains(oldArticleVoices, "voice1") && _.contains(oldArticleVoices, "voice2") && _.contains(oldArticleVoices, "voice3")){
        //console.log("don't add this article at all")
        //console.log(article)
        //DO NOTHING
      }else{
        //we definitely want the article
        articles.push(article)
        
        //find out which voices we want
        if( !_.contains(oldArticleVoices, "voice1") ){
          var field = "voice1"
          if(selectedArticleVoices.hasOwnProperty(article_id)){
            selectedArticleVoices[article_id].push(field)
          }else{
            selectedArticleVoices[article_id] = [field] 
          }           
        }
        if( !_.contains(oldArticleVoices, "voice2") ){
          var field = "voice2"
          if(selectedArticleVoices.hasOwnProperty(article_id)){
            selectedArticleVoices[article_id].push(field)
          }else{
            selectedArticleVoices[article_id] = [field] 
          }           
        }
        if( !_.contains(oldArticleVoices, "voice3") ){
          var field = "voice3"
          if(selectedArticleVoices.hasOwnProperty(article_id)){
            selectedArticleVoices[article_id].push(field)
          }else{
            selectedArticleVoices[article_id] = [field] 
          }           
        }                
      }
      
      
      
    //if oldSelectedArticleVoices DOES NOT have an entry for this article_id, we want to put this article and ALL it's voices in selectedArticleVoices 
    }else {
      articles.push(article)
      selectedArticleVoices[article_id] = ["voice1", "voice2", "voice3"] 
    }
  })
  
  
  return [articles, selectedArticleVoices]
}

intersectionOfResults = function (articles1, selectedArticleVoices1, articles2, selectedArticleVoices2){
  var articles = []
  var selectedArticleVoices = {} 
  
  var allArticles = Articles.find().fetch() 
  _.each(allArticles, function(article){
    var article_id = article._id
    
    //if BOTH selectAriticles have the article_id, then we want want to find out more. 
    //if not, then we already know we don't want it.
    if (selectedArticleVoices1.hasOwnProperty(article_id) && selectedArticleVoices2.hasOwnProperty(article_id)){
      var voices1 = selectedArticleVoices1[article_id]
      var voices2 = selectedArticleVoices2[article_id]
      
      var intersectionOfVoices = _.intersection(voices1, voices2)
      
      //if there are voices in the intersection, then we add this article to the set and the voices in the intersection
      if(intersectionOfVoices.length > 0 ){
        articles.push(article)
        selectedArticleVoices[article_id] = intersectionOfVoices
      }
    }
  })
  
  return [articles, selectedArticleVoices]
}