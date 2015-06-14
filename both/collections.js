Articles = new Meteor.Collection("articles")
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


//This is another way of viewing the data - each joke has it's own entry.
Voices = new Meteor.Collection("voices");
/*
id:
headline:
article_id: //index into Articles

description:
voice:
voice_number: //1, 2, or 3
likert_two_stories_counts.: {yes: 0, no:0, kinda:0}
*/


Comments = new Meteor.Collection("comments");
/*
id:
user_id:  
time:

article_id: article_id,
field: field, //headline, description, voice1, voice2, voice3

text: text //"very funny! point of view?" 
saturation: full or mid     

removed: false / true
removed_user_id:
removed_time: 
*/



Tags = new Meteor.Collection("tags");
/*
id:
tag:
counts:  
*/



TagApplications = new Meteor.Collection("tagApplications");
/*
id:
user_id:  
time:

article_id: article_id,
field: field, //headline, description, voice1, voice2, voice3
tag_id: 
tag:
*/


/*
Likerts - there are three places these are stored:

1. The overall summary of counts is is Likerts
This can be used to display the goal progress

2. Voices keeps a count for each voice how many yes,no, kindas it has.

3. LikertApplications is a log of all the activity - each likert that is entered, by whom, what time, etc.  

What policies do I need to explain here?
INSERT?
UPDATE?
   UNDO?????
  */

//This stories all the likerts at the highest level, and their counts
Likerts = new Meteor.Collection("likerts"); 
/*
id:
label: //"two-stories"
count_done:

count_yes:
count_no:
count_kinda:   
*/


//This Store
LikertApplications = new Meteor.Collection("likertApplications");
/*
id:
user_id:  
time:

article_id: article_id,
field: field, //headline, description, voice1, voice2, voice3

answer: "yes","no","kinda" //"very funny! point of view?" 
label: "Two-tone"   

removed: false / true
removed_user_id:
removed_time: 
*/


