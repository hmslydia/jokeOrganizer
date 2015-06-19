Meteor.methods({ 
  addCommentOrTag: function(params){
    params.time = getTime()
    params.user_id = Meteor.userId() || null //Session.get('userId') || null
    addCommentOrTag(params) 
    
  },
  removeComment: function(params){
    params.time = getTime()
    params.user_id = Meteor.userId() || null //Session.get('userId') || null
    removeComment(params) 
    
  },
  addLikert: function(params){
    console.log('addlikert')
    params.time = getTime()
    params.user_id = Meteor.userId() || null //Session.get('userId') || null
    addLikert(params) 
    
  },
  removeLikert: function(params){
    console.log('removelikert')
    params.time = getTime()
    params.user_id = Meteor.userId() || null //Session.get('userId') || null
    removeLikert(params) 
    
  },
  dimAll: function(){
    Comments.update({}, {$set: {saturation: "mid"}}, {multi:true})
  }
 
})

addCommentOrTag = function(params){
  /*
  id:
  user_id:  
  time:
  
  article_id: article_id,
  field: field, //headline, description, voice1, voice2, voice3
  
  text: text //"very funny! point of view?"        
  */
  var text = params.text
  if(text[0] == "#"){
    var spaceIndex = text.indexOf(" ")
    var tagText = text.substring(0, spaceIndex)
    if( spaceIndex == -1 ){
      tagText = text
    }
    
    
    var addTagAppParams = {
      user_id: params.user_id,
      time: params.time,
      article_id: params.article_id,
      field: params.field,
      tag: tagText
    }
    addTagApplication(addTagAppParams)
  }
  /* else {
    Comments.insert(params)
  }
  */
  params.removed = false
  Comments.insert(params)
}

removeComment = function(params){
  console.log(params)
  var id = params._id
  Comments.update(
    {_id: id},
    {$set:
      {
        removed: true,
        removed_user: params.user_id,
        removed_time: params.time
      }
      
    }
  )
  
  //if the comment has a tag, then we have to remove it from
  // tag application counts and POSSIBLY global tag counts
  var text = params.text
  
  if(text[0] == "#"){ //if there was a tag in the comment
    var spaceIndex = text.indexOf(" ")
    var tagText = text.substring(0, spaceIndex)
    if( spaceIndex == -1 ){
      tagText = text
    }
    //console.log()
    
    //reduce counts in TagCountsByObject
    
    var tagCountsByObjectObj = TagCountsByObject.findOne({
      article_id: params.article_id, 
      field: params.field,
      tag: tagText
    })
    
    //Decrement counts
    TagCountsByObject.update(
      {_id: tagCountsByObjectObj._id},
      {$inc: {counts: -1}}
    )
    
    if(tagCountsByObjectObj.counts == 1){
      var tag_id = Tags.update(
        {_id: tagCountsByObjectObj.tag_id},
        {$inc: {counts: -1}}
      )
    }
    
  }
  
}

addLikert = function(params){
  /*
  id:
  user_id:  
  time:
  
  article_id: article_id,
  field: field, //headline, description, voice1, voice2, voice3
  
  answer: "yes","no","kinda" //"very funny! point of view?" 
  label: "Two-tone"   
  
  removed: false
  */

  //Update Log (all actions)
  params.removed = false
  LikertApplications.insert(params)
  

  //UPDATE the individual likert counts for each voice.
  var voiceObj =  Voices.findOne({article_id: params.article_id, voice_number: params.field})
  
  var is_first_yes = false
  var is_first_no = false
  var is_first_kinda = false
  
  
  var inc = {}
  if (params.answer == "yes"){
    //right here I could check if the current count is zero
    is_first_yes = (voiceObj.likert_two_stories_counts.yes == 0) 
    inc["likert_two_stories_counts.yes"] = 1
  }
  if (params.answer == "no"){
    is_first_no = (voiceObj.likert_two_stories_counts.no == 0) 
    inc["likert_two_stories_counts.no"] = 1
  }
  if (params.answer == "kinda"){
    is_first_kinda = (voiceObj.likert_two_stories_counts.kinda == 0) 
    inc["likert_two_stories_counts.kinda"] = 1
  }

  Voices.update(
    {article_id: params.article_id, voice_number: params.field},
    {$inc: inc}
    )
  
  //UPDATE the overall likert counts for the goal
  var inc = {}
  if (is_first_yes){
    inc["count_yes"] = 1
  }
  if (is_first_no){
    inc["count_no"] = 1
  }
  if (is_first_kinda){
    inc["count_kinda"] = 1
  }
  Likerts.update(
    {label: "two-stories"}, 
      {$inc: inc }
  )
  
}

removeLikert = function(params){
  // mark as removed in LikertApplications
  var id = params._id
  LikertApplications.update(
    {_id: id},
    {$set:
      {
        removed: true,
        removed_user: params.user_id,
        removed_time: params.time
      }
      
    }
  )
  

  //UPDATE the individual likert counts for each voice.  
  var voiceObj =  Voices.findOne({article_id: params.article_id, voice_number: params.field})
  
  var is_first_yes = false
  var is_first_no = false
  var is_first_kinda = false
  
  
  var inc1 = {}
  if (params.answer == "yes"){
    //right here I could check if the current count is zero
    is_first_yes = (voiceObj.likert_two_stories_counts.yes == 1) 
    inc1["likert_two_stories_counts.yes"] = -1
  }
  if (params.answer == "no"){
    is_first_no = (voiceObj.likert_two_stories_counts.no == 1) 
    inc1["likert_two_stories_counts.no"] = -1
  }
  if (params.answer == "kinda"){
    is_first_kinda = (voiceObj.likert_two_stories_counts.kinda == 1) 
    inc1["likert_two_stories_counts.kinda"] = -1
  }

  Voices.update(
    {article_id: params.article_id, voice_number: params.field},
    {$inc: inc1}
    )
  
  //UPDATE the overall likert counts for the goal
  var inc2 = {}
  if (is_first_yes){
    inc2["count_yes"] = -1
  }
  if (is_first_no){
    inc2["count_no"] = -1
  }
  if (is_first_kinda){
    inc2["count_kinda"] = -1
  }
  Likerts.update(
    {label: "two-stories"}, 
      {$inc: inc2 }
  )

}

addTag = function(tag){
  console.log("add tag: "+tag)
  var tag_id = Tags.insert({
    tag: tag,
    counts: 0
  })
  return tag_id
}

addTagApplication = function(params){
  /*
  id:
  user_id:  
  time:
  
  article_id: article_id,
  field: field, //headline, description, voice1, voice2, voice3
  

  tag_id: // if it has this use it
  tag: "POV"  //If there is no tag id, try to look it up first, then if not, insert a new one.
  */
  //check if there is already an entry in the tag database for this tag
  var tag_id = params.tag_id
  
  if( !tag_id ){
    //check if the string exists
    var tagExists = Tags.find({tag: params.tag}).fetch()
    if(tagExists.length == 0){
      //add the new tag
      tag_id = addTag(params.tag)
    }
    else if(tagExists.length == 1){
      //add the new tag
      tag_id = tagExists[0]._id
    }  
    else {
      console.log("warning: multiple matching tags")
      tag_id = tagExists[0]._id
    }  
    
  } else {
    params.tag = Tags.findOne(tag_id).tag
  }
  
  
  //insert tag_id into TagApplication
  TagApplications.insert({
    user_id: params.user_id,
    time: getTime(),
    article_id: params.article_id,
    field: params.field,
    tag_id: tag_id,
    tag: params.tag,
    removed: false
  })
  
  
  //increment Voice and Headline tag counts.
  var is_first = false
  
  //INCREMENT tagCountsByObject
  var tagCountsByObjectObj = TagCountsByObject.find({
    article_id: params.article_id, 
    field: params.field,
    tag_id: tag_id
  }).fetch()
  
  //is there an entry
  if( tagCountsByObjectObj.length == 0){
    //insert a new one
    TagCountsByObject.insert({
      article_id: params.article_id,
      field: params.field,      
      tag: params.tag,
      tag_id: tag_id,
      counts: 1 
    })
    is_first = true
  } else {
    //increment
    var tagCountByObject_id = tagCountsByObjectObj[0]._id
    TagCountsByObject.update(
      {_id: tagCountByObject_id},
      {$inc: {  counts: 1 } }
    )
  }
  
  //increment Tag Count
  //if this is the first tag application for this voice/headline,then inrement it.
  if(is_first){
    Tags.update(
      tag_id, 
      { $inc: { counts: 1} }
    )    
  }

  
}

//Articles = new Meteor.Collection("articles")
/*
id:
headline:
description:
voice1:
voice2:
voice3:

voice1_id: //index into Voices
voice2_id: //index into Voices
voice3_id: //index into Voices
*/


//Voices = new Meteor.Collection("voices");
/*
id:
headline:
article_id: //index into Articles

description:
voice:
voice_number: //1, 2, or 3
*/

addArticles = function(offset, numArticles){
  console.log("add articles: ", numArticles)
    for (var i = offset; i < offset+numArticles; i++) {
      //insert into Articles
      var articleObj = voices[i]
      var article_id = Articles.insert(articleObj);
      
      //insert into Voices (3 entries)
      var headline = articleObj.headline
      var description = articleObj.description
      var voiceObj1 = {
        headline: headline,
        description: description,
        article_id: article_id,
        voice: articleObj.voice1,
        voice_number: "voice1",
        likert_two_stories_counts: {yes: 0, no: 0, kinda: 0},
      }
      var voice1_id = Voices.insert(voiceObj1)

      var voiceObj2 = {
        headline: headline,
        description: description,
        article_id: article_id,
        voice: articleObj.voice2,
        voice_number: "voice2",
        likert_two_stories_counts: {yes: 0, no: 0, kinda: 0},
      }
      var voice2_id = Voices.insert(voiceObj2)
      
      var voiceObj3 = {
        headline: headline,
        description: description,
        article_id: article_id,
        voice: articleObj.voice3,
        voice_number: "voice3",
        likert_two_stories_counts: {yes: 0, no: 0, kinda: 0},
      }
      var voice3_id = Voices.insert(voiceObj3)
           
      //update 
      Articles.update({_id: article_id}, {$set: {
        voice1_id: voice1_id,
        voice2_id: voice2_id,
        voice3_id: voice3_id
        }
      })           
    }  
}

Meteor.startup(function () {	
  /*
  if(Articles.find().count() == 20){
  
    var redundant_article_ids = ["nbJLzZCMpAcPsMFDa", "fCbEPLHpLeLPevxWb", "f8EsDgb2H9zYFDtAj", "EgyGb83GowhzLvGtL", "vDdB8ThZRWKKoQthh", "J3L2bRAwzoD92oNAo", "fNqJNFqWGLinrWnFz", "pJtpxWFSD6F38TEHF", "mEa48qWGjdMzAPvRv", "HX7i4a5dtBiK9QE39"]
    
    for(var i = 0; i< redundant_article_ids.length; i++){
      article_id = redundant_article_ids[i]
      console.log(article_id)
      Articles.remove({_id: article_id})
    }
  
  }
  if(Articles.find().count() == 10){
    
    var numArticles = 100 
    var offset = 10  
    addArticles(offset, numArticles)    
  }
  */
  if (Articles.find().count() === 0) {
    var numArticles = 10 
    var offset = 0  
    addArticles(offset, numArticles)
    
    //Add Likert
    var likertObj = {
      label: "two-stories",
      count_done: 0,
      
      count_yes: 0,
      count_no: 0,
      count_kinda: 0,             
    }      
    Likerts.insert(likertObj)
  }
})