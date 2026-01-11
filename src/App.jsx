import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, Plus, Trash2, Users, CheckSquare, 
  ArrowLeft, Swords, PartyPopper, RefreshCw, Home, LogOut
} from 'lucide-react';
import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot, updateDoc } from "firebase/firestore";

// --- FIREBASE CONFIG ---
// We add defaults here so the app doesn't crash on localhost
const firebaseConfig = {
  apiKey: "AIzaSy-PLACEHOLDER", // Replace with your real key
  authDomain: "fun-zone.firebaseapp.com",
  projectId: "fun-zone",
  storageBucket: "fun-zone.appspot.com",
  messagingSenderId: "0000000000",
  appId: "1:000:web:000"
};

const appId = 'fun-zone-default';

// Initialize Firebase safely
let app, auth, db;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// --- CONSTANTS & QUESTIONS ---
const Game = {
  NONE: 'NONE',
  TRUTH_OR_DARE: 'Truth or Dare',
  NEVER_HAVE_I_EVER: 'Never Have I Ever',
  WOULD_YOU_RATHER: 'Would You Rather',
};

const TdQuestionType = { TRUTH: 'TRUTH', DARE: 'DARE' };

const allTdQuestions = [
  // -------- TRUTH (100) --------
  { id: 1, text: "What is the most childish thing you still do?", type: TdQuestionType.TRUTH },
  { id: 2, text: "What is a secret you have never told anyone here?", type: TdQuestionType.TRUTH },
  { id: 3, text: "Who was your first crush?", type: TdQuestionType.TRUTH },
  { id: 4, text: "What is the biggest lie you have ever told?", type: TdQuestionType.TRUTH },
  { id: 5, text: "What is your biggest fear?", type: TdQuestionType.TRUTH },
  { id: 6, text: "What is something you regret doing?", type: TdQuestionType.TRUTH },
  { id: 7, text: "Who in this room do you trust the most?", type: TdQuestionType.TRUTH },
  { id: 8, text: "What is the most embarrassing moment of your life?", type: TdQuestionType.TRUTH },
  { id: 9, text: "Have you ever had a crush on a friend?", type: TdQuestionType.TRUTH },
  { id: 10, text: "What is your guilty pleasure?", type: TdQuestionType.TRUTH },

  { id: 11, text: "What is your biggest insecurity?", type: TdQuestionType.TRUTH },
  { id: 12, text: "Who was your last crush?", type: TdQuestionType.TRUTH },
  { id: 13, text: "Have you ever lied to your best friend?", type: TdQuestionType.TRUTH },
  { id: 14, text: "What is one habit you want to change?", type: TdQuestionType.TRUTH },
  { id: 15, text: "What is the worst advice you have followed?", type: TdQuestionType.TRUTH },
  { id: 16, text: "What makes you angry quickly?", type: TdQuestionType.TRUTH },
  { id: 17, text: "Who here do you admire the most?", type: TdQuestionType.TRUTH },
  { id: 18, text: "What is something people misunderstand about you?", type: TdQuestionType.TRUTH },
  { id: 19, text: "What scares you about the future?", type: TdQuestionType.TRUTH },
  { id: 20, text: "Have you ever cheated in an exam?", type: TdQuestionType.TRUTH },

  { id: 21, text: "What is your biggest weakness?", type: TdQuestionType.TRUTH },
  { id: 22, text: "Who was your last text message from?", type: TdQuestionType.TRUTH },
  { id: 23, text: "What lie do you tell most often?", type: TdQuestionType.TRUTH },
  { id: 24, text: "What makes you jealous?", type: TdQuestionType.TRUTH },
  { id: 25, text: "What is the worst decision you made?", type: TdQuestionType.TRUTH },
  { id: 26, text: "Who do you miss the most?", type: TdQuestionType.TRUTH },
  { id: 27, text: "What is your biggest relationship fear?", type: TdQuestionType.TRUTH },
  { id: 28, text: "Have you ever broken someone's heart?", type: TdQuestionType.TRUTH },
  { id: 29, text: "What is your hidden talent?", type: TdQuestionType.TRUTH },
  { id: 30, text: "What is one thing you are proud of?", type: TdQuestionType.TRUTH },


{ id: 31, text: "What is the most awkward conversation you've had?", type: TdQuestionType.TRUTH },
{ id: 32, text: "Have you ever pretended to like someone?", type: TdQuestionType.TRUTH },
{ id: 33, text: "What is something you are secretly proud of?", type: TdQuestionType.TRUTH },
{ id: 34, text: "Who was your first love?", type: TdQuestionType.TRUTH },
{ id: 35, text: "What is the worst habit you have?", type: TdQuestionType.TRUTH },
{ id: 36, text: "Have you ever ghosted someone?", type: TdQuestionType.TRUTH },
{ id: 37, text: "What makes you feel insecure?", type: TdQuestionType.TRUTH },
{ id: 38, text: "What lie do you tell most often?", type: TdQuestionType.TRUTH },
{ id: 39, text: "Who here knows you the best?", type: TdQuestionType.TRUTH },
{ id: 40, text: "What is your biggest weakness in relationships?", type: TdQuestionType.TRUTH },

{ id: 41, text: "Have you ever been caught lying?", type: TdQuestionType.TRUTH },
{ id: 42, text: "What is the most trouble you've been in?", type: TdQuestionType.TRUTH },
{ id: 43, text: "What scares you the most about love?", type: TdQuestionType.TRUTH },
{ id: 44, text: "What is something you overthink?", type: TdQuestionType.TRUTH },
{ id: 45, text: "Have you ever cried in public?", type: TdQuestionType.TRUTH },
{ id: 46, text: "What is your biggest emotional weakness?", type: TdQuestionType.TRUTH },
{ id: 47, text: "Who was your last crush?", type: TdQuestionType.TRUTH },
{ id: 48, text: "What is your biggest regret this year?", type: TdQuestionType.TRUTH },
{ id: 49, text: "What do people assume about you that is wrong?", type: TdQuestionType.TRUTH },
{ id: 50, text: "What is one secret you still keep?", type: TdQuestionType.TRUTH },
{ id: 51, text: "What is the most embarrassing thing in your room?", type: TdQuestionType.TRUTH },
{ id: 52, text: "Have you ever lied to get out of trouble?", type: TdQuestionType.TRUTH },
{ id: 53, text: "What is your biggest insecurity about your appearance?", type: TdQuestionType.TRUTH },
{ id: 54, text: "Who here would you trust with a big secret?", type: TdQuestionType.TRUTH },
{ id: 55, text: "What is something you've never told your parents?", type: TdQuestionType.TRUTH },
{ id: 56, text: "What is your most embarrassing childhood memory?", type: TdQuestionType.TRUTH },
{ id: 57, text: "Have you ever had a crush on a teacher?", type: TdQuestionType.TRUTH },
{ id: 58, text: "What is the worst gift you've ever received?", type: TdQuestionType.TRUTH },
{ id: 59, text: "What is one thing you wish you could change about yourself?", type: TdQuestionType.TRUTH },
{ id: 60, text: "What is the most awkward date you've ever been on?", type: TdQuestionType.TRUTH },
{ id: 61, text: "What is your biggest fear in friendships?", type: TdQuestionType.TRUTH },
{ id: 62, text: "Have you ever lied about your feelings?", type: TdQuestionType.TRUTH },
{ id: 63, text: "What is something you wish more people knew about you?", type: TdQuestionType.TRUTH },
{ id: 64, text: "Who here would you call in an emergency?", type: TdQuestionType.TRUTH },
{ id: 65, text: "What is your most embarrassing social media post?", type: TdQuestionType.TRUTH },
{ id: 66, text: "Have you ever pretended to be someone else online?", type: TdQuestionType.TRUTH },
{ id: 67, text: "What is your biggest insecurity about your personality?", type: TdQuestionType.TRUTH },
{ id: 68, text: "Who here would you trust with your deepest secret?", type: TdQuestionType.TRUTH },
{ id: 69, text: "What is something you've never told your best friend?", type: TdQuestionType.TRUTH },
{ id: 70, text: "What is the most embarrassing thing you've done for attention?", type: TdQuestionType.TRUTH },
{ id: 71, text: "What is your biggest fear about getting older?", type: TdQuestionType.TRUTH },
{ id: 72, text: "Have you ever lied to a significant other?", type: TdQuestionType.TRUTH },
{ id: 73, text: "What is something you wish you could tell your younger self?", type: TdQuestionType.TRUTH },
{ id: 74, text: "Who here would you want to be stranded on a desert island with?", type: TdQuestionType.TRUTH },
{ id: 75, text: "What is your most embarrassing fashion choice?", type: TdQuestionType.TRUTH },
{ id: 76, text: "Have you ever faked being sick to avoid plans?", type: TdQuestionType.TRUTH }, 
{ id: 77, text: "What is your biggest insecurity about your talents?", type: TdQuestionType.TRUTH },
{ id: 78, text: "Who here would you trust with your life?", type: TdQuestionType.TRUTH },
{ id: 79, text: "What is something you've never told your siblings?", type: TdQuestionType.TRUTH },
{ id: 80, text: "What is the most embarrassing thing you've done while drunk?", type: TdQuestionType.TRUTH },
{ id: 81, text: "What is your biggest fear about failure?", type: TdQuestionType.TRUTH },
{ id: 82, text: "Have you ever lied to a family member?", type: TdQuestionType.TRUTH },
{ id: 83, text: "What is something you wish you could change about your past?", type: TdQuestionType.TRUTH },
{ id: 84, text: "Who here would you want to switch lives with for a day?", type: TdQuestionType.TRUTH },
{ id: 85, text: "What is your most embarrassing moment at work or school?", type: TdQuestionType.TRUTH },
{ id: 86, text: "Have you ever pretended to like a gift?", type: TdQuestionType.TRUTH },
{ id: 87, text: "What is your biggest insecurity about your intelligence?", type: TdQuestionType.TRUTH },
{ id: 88, text: "Who here would you trust with your biggest dream?", type: TdQuestionType.TRUTH },
{ id: 89, text: "What is something you've never told your partner?", type: TdQuestionType.TRUTH },
{ id: 90, text: "What is the most embarrassing thing you've done in public?", type: TdQuestionType.TRUTH },
{ id: 91, text: "What is your biggest fear about rejection?", type: TdQuestionType.TRUTH },
{ id: 92, text: "Have you ever lied to a friend to avoid hanging out?", type: TdQuestionType.TRUTH },
{ id: 93, text: "What is something you wish you could change about your personality?", type: TdQuestionType.TRUTH },
{ id: 94, text: "Who here would you want to go on a road trip with?", type: TdQuestionType.TRUTH },
{ id: 95, text: "What is your most embarrassing childhood nickname?", type: TdQuestionType.TRUTH },
{ id: 96, text: "Have you ever faked liking a hobby to impress someone?", type: TdQuestionType.TRUTH },
{ id: 97, text: "What is your biggest insecurity about your social skills?", type: TdQuestionType.TRUTH },
{ id: 98, text: "Who here would you trust with your biggest secret?", type: TdQuestionType.TRUTH },
{ id: 99, text: "What is something you've never told your coworkers?", type: TdQuestionType.TRUTH },
{ id: 100, text: "What is the most embarrassing thing you've done on a date?", type: TdQuestionType.TRUTH },
  

// -------- DARE (100) --------
  { id: 101, text: "Do 10 pushups right now.", type: TdQuestionType.DARE },
  { id: 102, text: "Dance without music for 30 seconds.", type: TdQuestionType.DARE },
  { id: 103, text: "Sing your favorite song loudly.", type: TdQuestionType.DARE },
  { id: 104, text: "Act like a cat for 1 minute.", type: TdQuestionType.DARE },
  { id: 105, text: "Talk in an accent for the next 2 minutes.", type: TdQuestionType.DARE },
  { id: 106, text: "Do your best celebrity impression.", type: TdQuestionType.DARE },
  { id: 107, text: "Spin around 10 times and walk straight.", type: TdQuestionType.DARE },
  { id: 108, text: "Post an emoji-only status on social media.", type: TdQuestionType.DARE },
  { id: 109, text: "Do 20 jumping jacks.", type: TdQuestionType.DARE },
  { id: 110, text: "Say the alphabet backwards.", type: TdQuestionType.DARE },

  { id: 111, text: "Send a funny emoji to your last contact.", type: TdQuestionType.DARE },
  { id: 112, text: "Talk like a robot for 1 minute.", type: TdQuestionType.DARE },
  { id: 113, text: "Do a runway walk across the room.", type: TdQuestionType.DARE },
  { id: 114, text: "Sing everything you say for 2 minutes.", type: TdQuestionType.DARE },
  { id: 115, text: "Pretend to be a news reporter.", type: TdQuestionType.DARE },
  { id: 116, text: "Do your best evil laugh.", type: TdQuestionType.DARE },
  { id: 117, text: "Stand on one leg for 30 seconds.", type: TdQuestionType.DARE },
  { id: 118, text: "Talk without closing your mouth for 1 minute.", type: TdQuestionType.DARE },
  { id: 119, text: "Do a dramatic movie dialogue.", type: TdQuestionType.DARE },
  { id: 120, text: "Pretend you are invisible for 1 minute.", type: TdQuestionType.DARE },


{ id: 121, text: "Do 15 squats.", type: TdQuestionType.DARE },
{ id: 122, text: "Sing a song chosen by the group.", type: TdQuestionType.DARE },
{ id: 123, text: "Act like a monkey for 30 seconds.", type: TdQuestionType.DARE },
{ id: 124, text: "Speak only in whispers for 2 minutes.", type: TdQuestionType.DARE },
{ id: 125, text: "Send a voice note saying hello to a contact.", type: TdQuestionType.DARE },
{ id: 126, text: "Dance like nobody is watching.", type: TdQuestionType.DARE },
{ id: 127, text: "Pretend to be a superhero.", type: TdQuestionType.DARE },
{ id: 128, text: "Do your best villain laugh.", type: TdQuestionType.DARE },
{ id: 129, text: "Say three nice things about the person next to you.", type: TdQuestionType.DARE },
{ id: 130, text: "Walk like a model for one round.", type: TdQuestionType.DARE },

{ id: 131, text: "Talk in slow motion for 1 minute.", type: TdQuestionType.DARE },
{ id: 132, text: "Clap every time you speak for 2 minutes.", type: TdQuestionType.DARE },
{ id: 133, text: "Do a fake proposal to someone.", type: TdQuestionType.DARE },
{ id: 134, text: "Act like a baby for 30 seconds.", type: TdQuestionType.DARE },
{ id: 135, text: "Say the alphabet skipping every second letter.", type: TdQuestionType.DARE },
{ id: 136, text: "Pretend you're drunk (without drinking).", type: TdQuestionType.DARE },
{ id: 137, text: "Do 10 jumping jacks.", type: TdQuestionType.DARE },
{ id: 138, text: "Talk like a cartoon character.", type: TdQuestionType.DARE },
{ id: 139, text: "Freeze in a funny pose for 20 seconds.", type: TdQuestionType.DARE },
{ id: 140, text: "Say one embarrassing fact loudly.", type: TdQuestionType.DARE },
{ id: 141, text: "Do your best dance move.", type: TdQuestionType.DARE },
{ id: 142, text: "Pretend to be a statue for 1 minute.", type: TdQuestionType.DARE },
{ id: 143, text: "Talk in rhymes for 2 minutes.", type: TdQuestionType.DARE },
{ id: 144, text: "Do a silly walk across the room.", type: TdQuestionType.DARE },
{ id: 145, text: "Make a funny face and hold it for 30 seconds.", type: TdQuestionType.DARE },
{ id: 146, text: "Sing your favorite nursery rhyme.", type: TdQuestionType.DARE },
{ id: 147, text: "Do 5 cartwheels (or try to).", type: TdQuestionType.DARE },
{ id: 148, text: "Pretend to be a waiter/waitress taking orders.", type: TdQuestionType.DARE },
{ id: 149, text: "Talk like a pirate for 2 minutes.", type: TdQuestionType.DARE },
{ id: 150, text: "Do your best runway model walk.", type: TdQuestionType.DARE },
{ id: 151, text: "Act like you're on a cooking show.", type: TdQuestionType.DARE },
{ id: 152, text: "Do 20 sit-ups.", type: TdQuestionType.DARE },
{ id: 153, text: "Sing everything you say for 1 minute.", type: TdQuestionType.DARE },
{ id: 154, text: "Pretend to be a zombie.", type: TdQuestionType.DARE },
{ id: 155, text: "Do your best animal sound.", type: TdQuestionType.DARE },
{ id: 156, text: "Talk in gibberish for 1 minute.", type: TdQuestionType.DARE },
{ id: 157, text: "Do a dramatic reading of a text message.", type: TdQuestionType.DARE },
{ id: 158, text: "Pretend to be a fashion model.", type: TdQuestionType.DARE },
{ id: 159, text: "Do 10 burpees.", type: TdQuestionType.DARE },
{ id: 160, text: "Act like you're on a reality TV show.", type: TdQuestionType.DARE },
{ id: 161, text: "Do your best impression of someone in the room.", type: TdQuestionType.DARE },
{ id: 162, text: "Sing a song chosen by the group.", type: TdQuestionType.DARE },
{ id: 163, text: "Dance like a ballerina.", type: TdQuestionType.DARE },
{ id: 164, text: "Talk in a funny voice for 2 minutes.", type: TdQuestionType.DARE },
{ id: 165, text: "Do a silly dance for 30 seconds.", type: TdQuestionType.DARE },
{ id: 166, text: "Pretend to be a news anchor.", type: TdQuestionType.DARE },
{ id: 167, text: "Do your best superhero pose.", type: TdQuestionType.DARE },
{ id: 168, text: "Talk like a cowboy/cowgirl for 2 minutes.", type: TdQuestionType.DARE },
{ id: 169, text: "Do 15 lunges.", type: TdQuestionType.DARE },
{ id: 170, text: "Act like you're on a game show.", type: TdQuestionType.DARE },
{ id: 171, text: "Do your best impression of a celebrity.", type: TdQuestionType.DARE },
{ id: 172, text: "Sing a song in a funny voice.", type: TdQuestionType.DARE },
{ id: 173, text: "Dance like a robot for 30 seconds.", type: TdQuestionType.DARE },
{ id: 174, text: "Talk in a silly accent for 2 minutes.", type: TdQuestionType.DARE },
{ id: 175, text: "Do a funny walk across the room.", type: TdQuestionType.DARE },
{ id: 176, text: "Pretend to be a fashion designer.", type: TdQuestionType.DARE },
{ id: 177, text: "Do 10 sit-ups.", type: TdQuestionType.DARE },
{ id: 178, text: "Act like you're on a cooking show.", type: TdQuestionType.DARE },
{ id: 179, text: "Do your best animal impression.", type: TdQuestionType.DARE },
{ id: 180, text: "Talk in rhymes for 1 minute.", type: TdQuestionType.DARE },
{ id: 181, text: "Sing a nursery rhyme loudly.", type: TdQuestionType.DARE },
{ id: 182, text: "Do a silly dance move.", type: TdQuestionType.DARE },
{ id: 183, text: "Pretend to be a waiter/waitress taking orders.", type: TdQuestionType.DARE },
{ id: 184, text: "Talk like a pirate for 1 minute.", type: TdQuestionType.DARE },
{ id: 185, text: "Do your best runway model walk.", type: TdQuestionType.DARE },
{ id: 186, text: "Act like you're on a reality TV show.", type: TdQuestionType.DARE },
{ id: 187, text: "Do your best impression of someone in the room.", type: TdQuestionType.DARE },
{ id: 188, text: "Sing a song chosen by the group.", type: TdQuestionType.DARE },
{ id: 189, text: "Dance like a ballerina.", type: TdQuestionType.DARE },
{ id: 190, text: "Talk in a funny voice for 1 minute.", type: TdQuestionType.DARE },
{ id: 191, text: "Do a silly dance for 15 seconds.", type: TdQuestionType.DARE },
{ id: 192, text: "Pretend to be a news reporter.", type: TdQuestionType.DARE },
{ id: 193, text: "Do your best superhero pose.", type: TdQuestionType.DARE },
{ id: 194, text: "Talk like a cowboy/cowgirl for 1 minute.", type: TdQuestionType.DARE },
{ id: 195, text: "Do 10 jumping jacks.", type: TdQuestionType.DARE },
{ id: 196, text: "Act like you're on a game show.", type: TdQuestionType.DARE },
{ id: 197, text: "Do your best impression of a celebrity.", type: TdQuestionType.DARE },
{ id: 198, text: "Sing a song in a funny voice.", type: TdQuestionType.DARE },
{ id: 199, text: "Dance like a robot for 15 seconds.", type: TdQuestionType.DARE },
{ id: 200, text: "Talk in a silly accent for 1 minute.", type: TdQuestionType.DARE },

];

const allNhieQuestions = [
  { id: 501, text: "Never have I ever skipped school or work." },
  { id: 502, text: "Never have I ever lied to my parents." },
  { id: 503, text: "Never have I ever stalked someone online." },
  { id: 504, text: "Never have I ever fallen asleep in class." },
  { id: 505, text: "Never have I ever forgotten a close friend's birthday." },
  { id: 506, text: "Never have I ever sent a message to the wrong person." },
  { id: 507, text: "Never have I ever cheated in a game." },
  { id: 508, text: "Never have I ever laughed at the wrong moment." },
  { id: 509, text: "Never have I ever cried during a movie." },
  { id: 510, text: "Never have I ever stayed awake all night." },

  { id: 511, text: "Never have I ever lied about my age." },
  { id: 512, text: "Never have I ever pretended to be busy." },
  { id: 513, text: "Never have I ever ignored someone's message." },
  { id: 514, text: "Never have I ever broken something and blamed someone else." },
  { id: 515, text: "Never have I ever Googled myself." },
  { id: 516, text: "Never have I ever binge-watched a series in one day." },
  { id: 517, text: "Never have I ever talked to myself." },
  { id: 518, text: "Never have I ever had a crush on a teacher." },
  { id: 519, text: "Never have I ever overslept an important event." },
  { id: 520, text: "Never have I ever lied to avoid trouble." },
  { id: 521, text: "Never have I ever forgotten where I parked my car." },
  { id: 522, text: "Never have I ever eaten food that fell on the floor." },
  { id: 523, text: "Never have I ever pretended to know a stranger." },
  { id: 524, text: "Never have I ever lost my keys." },
  { id: 525, text: "Never have I ever sung in the shower." },
  { id: 526, text: "Never have I ever danced when no one was watching." },
  { id: 527, text: "Never have I ever forgotten a friend's name." },
  { id: 528, text: "Never have I ever lied about liking a gift." },
  { id: 529, text: "Never have I ever stayed in my pajamas all day." },
  { id: 530, text: "Never have I ever made a prank call." },
  { id: 531, text: "Never have I ever spilled a secret." },
  { id: 532, text: "Never have I ever walked into a glass door." },
  { id: 533, text: "Never have I ever forgotten to reply to an important email." },
  { id: 534, text: "Never have I ever pretended to be sick to skip plans." },
  { id: 535, text: "Never have I ever eaten dessert before dinner." },
  { id: 536, text: "Never have I ever laughed so hard I cried." },
  { id: 537, text: "Never have I ever worn clothes inside out all day." },
  { id: 538, text: "Never have I ever forgotten to set an alarm." },
  { id: 539, text: "Never have I ever tried to push a door that said pull." },
  { id: 540, text: "Never have I ever sung karaoke in public." },

  { id: 541, text: "Never have I ever stayed up past 3 AM." },
  { id: 542, text: "Never have I ever eaten something just because it looked good." },
  { id: 543, text: "Never have I ever forgotten to pick up someone." },
  { id: 544, text: "Never have I ever worn mismatched socks." },
  { id: 545, text: "Never have I ever told a joke that no one laughed at." },
  { id: 546, text: "Never have I ever fallen asleep during a meeting." },
  { id: 547, text: "Never have I ever sent a text with a typo that changed the meaning." },
  { id: 548, text: "Never have I ever forgotten an important anniversary." },
  { id: 549, text: "Never have I ever eaten food that was too spicy." },  
  { id: 550, text: "Never have I ever walked into the wrong restroom." },
  { id: 551, text: "Never have I ever lied about my weekend plans." },
  { id: 552, text: "Never have I ever forgotten to return a borrowed item." },
  { id: 553, text: "Never have I ever danced in public." },
  { id: 554, text: "Never have I ever stayed in bed all day." },
  { id: 555, text: "Never have I ever made a funny face in a serious photo." },
  { id: 556, text: "Never have I ever forgotten to bring my wallet." },
  { id: 557, text: "Never have I ever sung in public." },
  { id: 558, text: "Never have I ever worn pajamas to a video call." },
  { id: 559, text: "Never have I ever told a white lie." },
  { id: 560, text: "Never have I ever forgotten to charge my phone." },

  { id: 561, text: "Never have I ever danced like no one was watching." },
  { id: 562, text: "Never have I ever eaten breakfast for dinner." },
  { id: 563, text: "Never have I ever forgotten to lock my door." },
  { id: 564, text: "Never have I ever worn sunglasses indoors." },
  { id: 565, text: "Never have I ever told a secret by mistake." },
  { id: 566, text: "Never have I ever fallen asleep in public." },
  { id: 567, text: "Never have I ever sent a message to the wrong group chat." },
  { id: 568, text: "Never have I ever forgotten to water a plant." },
  { id: 569, text: "Never have I ever eaten food that was past its expiration date." },
  { id: 570, text: "Never have I ever worn clothes inside out." },

  { id: 571, text: "Never have I ever laughed at my own joke." },
  { id: 572, text: "Never have I ever forgotten to pick up groceries." },
  { id: 573, text: "Never have I ever danced in my room alone." },
  { id: 574, text: "Never have I ever told a joke that made no sense." },
  { id: 575, text: "Never have I ever fallen asleep while reading." },
  { id: 576, text: "Never have I ever sent a text with autocorrect fails." },
  { id: 577, text: "Never have I ever forgotten an important meeting." },
  { id: 578, text: "Never have I ever eaten food that was too cold." },
  { id: 579, text: "Never have I ever walked into a wall." },
  { id: 580, text: "Never have I ever sung in the car." },

  { id: 581, text: "Never have I ever stayed up all night binge-watching a show." },
  { id: 582, text: "Never have I ever eaten dessert before a meal." },
  { id: 583, text: "Never have I ever forgotten to bring my ID." },
  { id: 584, text: "Never have I ever worn pajamas to a store." },
  { id: 585, text: "Never have I ever told a secret I wasn't supposed to." },
  { id: 586, text: "Never have I ever fallen asleep during a movie." },
  { id: 587, text: "Never have I ever sent a message to the wrong person." },
  { id: 588, text: "Never have I ever forgotten to feed a pet." },  
  { id: 589, text: "Never have I ever eaten food that was too salty." },
  { id: 590, text: "Never have I ever worn mismatched shoes." },

  { id: 591, text: "Never have I ever laughed so hard I snorted." },
  { id: 592, text: "Never have I ever forgotten to pick up my dry cleaning." },
  { id: 593, text: "Never have I ever danced in the rain." },
  { id: 594, text: "Never have I ever told a joke that offended someone." },
  { id: 595, text: "Never have I ever fallen asleep on public transport." },
  { id: 596, text: "Never have I ever sent a text with embarrassing autocorrect." },
  { id: 597, text: "Never have I ever forgotten an important deadline." },
  { id: 598, text: "Never have I ever eaten food that was too sweet." },
  { id: 599, text: "Never have I ever walked into a pole." },
  { id: 600, text: "Never have I ever sung in front of a crowd." },
  
];

const allWyrQuestions = [
  { id: 601, optionA: "be able to fly", optionB: "be invisible" },
  { id: 602, optionA: "have unlimited money", optionB: "have unlimited time" },
  { id: 603, optionA: "never use social media", optionB: "never watch movies" },
  { id: 604, optionA: "always be late", optionB: "always be early" },
  { id: 605, optionA: "live without music", optionB: "live without movies" },
  { id: 606, optionA: "travel the world", optionB: "stay in one dream city" },
  { id: 607, optionA: "be famous", optionB: "be rich but unknown" },
  { id: 608, optionA: "lose your phone", optionB: "lose your wallet" },
  { id: 609, optionA: "work only nights", optionB: "work only mornings" },
  { id: 610, optionA: "always tell the truth", optionB: "always lie" },

  { id: 611, optionA: "read minds", optionB: "see the future" },
  { id: 612, optionA: "never feel fear", optionB: "never feel sadness" },
  { id: 613, optionA: "have no responsibilities", optionB: "have unlimited power" },
  { id: 614, optionA: "be extremely lucky", optionB: "be extremely intelligent" },
  { id: 615, optionA: "restart life", optionB: "fast forward life" },
  { id: 616, optionA: "live in the past", optionB: "live in the future" },
  { id: 617, optionA: "always be cold", optionB: "always be hot" },
  { id: 618, optionA: "never eat sweets", optionB: "never eat spicy food" },
  { id: 619, optionA: "have more time", optionB: "have more money" },
  { id: 620, optionA: "work from home forever", optionB: "travel for work forever" },
  { id: 621, optionA: "be able to talk to animals", optionB: "speak all human languages" },
  { id: 622, optionA: "live without internet", optionB: "live without air conditioning" },
  { id: 623, optionA: "be the smartest person", optionB: "be the funniest person" },  
  { id: 624, optionA: "have a rewind button", optionB: "have a pause button" },
  { id: 625, optionA: "be able to teleport", optionB: "be able to time travel" },
  { id: 626, optionA: "always be hungry", optionB: "always be thirsty" },
  { id: 627, optionA: "live in a big city", optionB: "live in a small town" },
  { id: 628, optionA: "have a personal chef", optionB: "have a personal trainer" },
  { id: 629, optionA: "be able to breathe underwater", optionB: "be able to fly" },
  { id: 630, optionA: "never have to sleep", optionB: "never have to eat" },

  { id: 631, optionA: "be able to control fire", optionB: "be able to control water" },
  { id: 632, optionA: "have a photographic memory", optionB: "have super strength" },
  { id: 633, optionA: "live without music", optionB: "live without books" },
  { id: 634, optionA: "always be in a good mood", optionB: "always be healthy" },
  { id: 635, optionA: "be able to see through walls", optionB: "be able to walk through walls" },
  { id: 636, optionA: "have unlimited energy", optionB: "have unlimited creativity" },
  { id: 637, optionA: "be able to change the past", optionB: "be able to change the future" },
  { id: 638, optionA: "never get tired", optionB: "never get hungry" },
  { id: 639, optionA: "live in space", optionB: "live under the sea" },
  { id: 640, optionA: "be able to talk to plants", optionB: "be able to talk to animals" },

  { id: 641, optionA: "have a flying car", optionB: "have a submarine car" },
  { id: 642, optionA: "be able to control the weather", optionB: "be able to control time" },
  { id: 643, optionA: "have a personal robot", optionB: "have a personal AI assistant" },   
  { id: 644, optionA: "be able to read minds", optionB: "be able to see the future" },
  { id: 645, optionA: "live without television", optionB: "live without internet" },
  { id: 646, optionA: "always be fashionable", optionB: "always be comfortable" },
  { id: 647, optionA: "have a magic carpet", optionB: "have a personal spaceship" },
  { id: 648, optionA: "be able to control animals", optionB: "be able to control people" },
  { id: 649, optionA: "never have to work", optionB: "never have to sleep" },
  { id: 650, optionA: "be able to change your appearance at will", optionB: "be able to change your voice at will" },

  { id: 651, optionA: "have super speed", optionB: "have super strength" },
  { id: 652, optionA: "live in a treehouse", optionB: "live in a castle" },
  { id: 653, optionA: "be able to control technology", optionB: "be able to control nature" },
  { id: 654, optionA: "have a personal island", optionB: "have a personal mountain cabin" },
  { id: 655, optionA: "be able to speak to ghosts", optionB: "be able to see the future" },
  { id: 656, optionA: "live without chocolate", optionB: "live without coffee" },
  { id: 657, optionA: "always be surrounded by friends", optionB: "always have alone time" },
  { id: 658, optionA: "have a pet dragon", optionB: "have a pet unicorn" },
  { id: 659, optionA: "never have to pay for anything", optionB: "never have to wait in line" },
  { id: 660, optionA: "be able to control dreams", optionB: "be able to control reality" },

  { id: 661, optionA: "have a time machine", optionB: "have a teleportation device" },
  { id: 662, optionA: "live in a world without music", optionB: "live in a world without art" },
  { id: 663, optionA: "always be able to find parking", optionB: "always have free gas" },
  { id: 664, optionA: "be able to speak all languages", optionB: "be able to play all instruments" },
  { id: 665, optionA: "have a personal chef", optionB: "have a personal stylist" },
  { id: 666, optionA: "be able to control fire", optionB: "be able to control ice" },
  { id: 667, optionA: "live in a world without books", optionB: "live in a world without movies" },
  { id: 668, optionA: "always be able to find lost items", optionB: "always remember everything" },
  { id: 669, optionA: "have a personal spaceship", optionB: "have a personal submarine" },
  { id: 670, optionA: "be able to control time", optionB: "be able to control space" },

  { id: 671, optionA: "have super hearing", optionB: "have super sight" },
  { id: 672, optionA: "live in a world without technology", optionB: "live in a world without nature" },
  { id: 673, optionA: "always be able to find food", optionB: "always have clean water" },
  { id: 674, optionA: "be able to speak to animals", optionB: "be able to speak to plants" },
  { id: 675, optionA: "have a personal robot", optionB: "have a personal AI" },
  { id: 676, optionA: "be able to control weather", optionB: "be able to control emotions" },
  { id: 677, optionA: "live in a world without colors", optionB: "live in a world without sounds" },
  { id: 678, optionA: "always be able to find friends", optionB: "always have alone time" },
  { id: 679, optionA: "have a pet phoenix", optionB: "have a pet griffin" },
  { id: 680, optionA: "never have to sleep", optionB: "never have to eat" },

  { id: 681, optionA: "be able to control gravity", optionB: "be able to control magnetism" },
  { id: 682, optionA: "have a photographic memory", optionB: "have super agility" },
  { id: 683, optionA: "live without movies", optionB: "live without games" },
  { id: 684, optionA: "always be in a good mood", optionB: "always be healthy" },
  { id: 685, optionA: "be able to see through objects", optionB: "be able to walk through objects" },
  { id: 686, optionA: "have unlimited creativity", optionB: "have unlimited knowledge" },
  { id: 687, optionA: "be able to change your age at will", optionB: "be able to change your height at will" },
  { id: 688, optionA: "never get thirsty", optionB: "never get tired" },
  { id: 689, optionA: "live on a floating island", optionB: "live in an underground city" },
  { id: 690, optionA: "be able to talk to insects", optionB: "be able to talk to birds" },

  { id: 691, optionA: "have a hoverboard", optionB: "have jet boots" },
  { id: 692, optionA: "be able to control light", optionB: "be able to control darkness" },
  { id: 693, optionA: "have a personal hologram", optionB: "have a personal clone" },
  { id: 694, optionA: "be able to read emotions", optionB: "be able to erase memories" },
  { id: 695, optionA: "live without video games", optionB: "live without sports" },
  { id: 696, optionA: "always be stylish", optionB: "always be practical" },
  { id: 697, optionA: "have a magic wand", optionB: "have a magic mirror" },
  { id: 698, optionA: "be able to control plants", optionB: "be able to control animals" },
  { id: 699, optionA: "never have to work again", optionB: "never have to sleep again" },
  { id: 700, optionA: "be able to change your memories", optionB: "be able to change your dreams" },

  { id: 701, optionA: "have super reflexes", optionB: "have super endurance" },
  { id: 702, optionA: "live in a floating city", optionB: "live in a subterranean city" },
  { id: 703, optionA: "be able to control sound", optionB: "be able to control silence" },
  { id: 704, optionA: "always be able to find shelter", optionB: "always have food" },
  { id: 705, optionA: "be able to speak to mythical creatures", optionB: "be able to see mythical creatures" },
  { id: 706, optionA: "have a personal AI companion", optionB: "have a personal robot butler" },
  { id: 707, optionA: "be able to control lightening", optionB: "be able to control wind" },
  { id: 708, optionA: "live in a world without seasons", optionB: "live in a world without weather" },
  { id: 709, optionA: "always be able to find love", optionB: "always have success in career" },
  { id: 710, optionA: "have a pet mermaid", optionB: "have a pet centaur" },

  // Extend safely till 720+
];

// --- API HELPER FOR AI DARES ---
const callGemini = async (prompt) => {
  const apiKey = "YOUR_GOOGLE_API_KEY"; // Replace with your real API key
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
  
  const payload = { 
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: "You are a fun party game host. Generate short, engaging game content." }] }
  };

  const fetchWithRetry = async (retries = 5, delay = 1000) => {
    try {
      const response = await fetch(apiUrl, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      });
      if (!response.ok) throw new Error("API Failure");
      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (error) {
      if (retries > 0) {
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(retries - 1, delay * 2);
      }
      throw error;
    }
  };

  try {
    return await fetchWithRetry();
  } catch (error) {
    return "Error generating content. Try again!";
  }
};


// --- UI COMPONENTS ---
const ScreenWrapper = ({ children }) => (
  <div className="bg-slate-950 text-white min-h-screen font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
    <div className="w-full max-w-md mx-auto relative">{children}</div>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, className = '', variant = 'primary', disabled = false, loading = false }) => {
  const base = 'w-full text-center font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-300',
    truth: 'bg-emerald-500 hover:bg-emerald-400 text-white',
    dare: 'bg-rose-500 hover:bg-rose-400 text-white',
    ai: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    outline: 'border-2 border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
  };
   return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} disabled={disabled || loading}>
      {loading && <RefreshCw className="animate-spin w-5 h-5" />}
      {children}
    </button>
  );
};

const BackButton = ({ onClick }) => (
  <button onClick={onClick} className="absolute -top-12 left-0 text-slate-400 hover:text-white flex items-center gap-1 transition z-10">
    <ArrowLeft size={20} /> Back
  </button>
);

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeGame, setActiveGame] = useState(Game.NONE);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.error("Auth Error", e); }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  const goHome = () => setActiveGame(Game.NONE);

  return (
    <ScreenWrapper>
      {activeGame === Game.NONE && <FunZoneMenu onSelect={setActiveGame} />}
      {activeGame === Game.TRUTH_OR_DARE && <TruthOrDareGame onBack={goHome} />}
      {activeGame === Game.NEVER_HAVE_I_EVER && <NhieGame onBack={goHome} userId={user?.uid} />}
      {activeGame === Game.WOULD_YOU_RATHER && <WyrGame onBack={goHome} />}
    </ScreenWrapper>
  );
}

function FunZoneMenu({ onSelect }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h1 className="text-6xl font-black tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
          FUN ZONE
        </h1>
        <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">Pick your party vibe</p>
      </div>
      
      <div className="grid gap-4">
        <MenuButton icon={<Swords className="text-emerald-400" />} title="Truth or Dare" desc="Classic group challenge" onClick={() => onSelect(Game.TRUTH_OR_DARE)} />
        <MenuButton icon={<PartyPopper className="text-purple-400" />} title="Never Have I Ever" desc="The confession game" onClick={() => onSelect(Game.NEVER_HAVE_I_EVER)} />
        <MenuButton icon={<CheckSquare className="text-orange-400" />} title="Would You Rather" desc="Tough choices only" onClick={() => onSelect(Game.WOULD_YOU_RATHER)} />
      </div>
    </div>
  );
}

function MenuButton({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-3xl hover:bg-slate-800/80 transition-all group text-left active:scale-[0.98]">
      <div className="bg-slate-950 p-4 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
      <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
    </button>
  );
}

// --- FULL TRUTH OR DARE WITH BOTTLE SPIN ---
function TruthOrDareGame({ onBack }) {
  const [step, setStep] = useState('setup'); 
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bottleRotation, setBottleRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const addPlayer = () => {
    if (nameInput.trim()) {
      setPlayers([...players, { id: Date.now(), name: nameInput.trim() }]);
      setNameInput('');
    }
  };

  const spin = () => {
    if (step !== 'spinning' || players.length === 0) return;

    // Filter players who haven't had a turn in the current cycle
    const unplayed = players.filter(p => !playerHistory.includes(p.id));
    
    let pool = unplayed;
    let nextHistory = playerHistory;

    // Reset if everyone has played
    if (unplayed.length === 0) {
      // To avoid the same person going twice in a row during reset:
      const lastPlayerId = playerHistory[playerHistory.length - 1];
      pool = players.filter(p => p.id !== lastPlayerId);
      nextHistory = [];
    }

    // Pick a truly random winner from the eligible pool
    const winner = pool[Math.floor(Math.random() * pool.length)];
    const winnerIndex = players.findIndex(p => p.id === winner.id);
    
    // Bottle Physics: Extra chaos
    const spins = 8 + Math.floor(Math.random() * 5); // 8 to 12 full rotations
    const targetAngle = (winnerIndex / players.length) * 360;
    
    // We add a slight random offset so it's not perfectly centered on the text
    const randomOffset = (Math.random() - 0.5) * 15; 
    
    const currentRotation = bottleRotation;
    const nextRotation = currentRotation + (spins * 360) + ((targetAngle - (currentRotation % 360) + 360) % 360) + randomOffset;

    setBottleRotation(nextRotation);
    setPlayerHistory([...nextHistory, winner.id]);

    setTimeout(() => {
      setCurrentPlayer(winner);
      setStep('selection');
    }, 3200);
  };

  const getQuestion = (type) => {
    // Filter available questions (avoiding repeats if possible)
    let available = allTdQuestions.filter(q => q.type === type && !usedQuestions.includes(q.id));
    
    // If all questions of this type used, reset history for this type
    if (available.length === 0) {
      available = allTdQuestions.filter(q => q.type === type);
      setUsedQuestions(prev => prev.filter(id => !allTdQuestions.find(q => q.id === id && q.type === type)));
    }

    const q = available[Math.floor(Math.random() * available.length)];
    setResult({ type, text: q.text });
    setUsedQuestions(prev => [...prev, q.id]);
    setStep('result');
  };

  const getAiDare = async () => {
    setLoading(true);
    const dare = await callGemini(`Generate a funny, safe, and unexpected party dare for ${currentPlayer.name}. Ensure it's original. One sentence.`);
    setResult({ type: 'DARE (AI)', text: dare });
    setLoading(false);
    setStep('result');
  };

  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <BackButton onClick={onBack} />
        <Card>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users className="text-indigo-400" /> Players</h2>
          <div className="flex gap-2 mb-4">
            <input className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl outline-none focus:border-indigo-500 transition-colors" placeholder="Enter name..." value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlayer()} />
            <button onClick={addPlayer} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition-colors"><Plus /></button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
            {players.map(p => (
              <div key={p.id} className="bg-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 animate-in zoom-in-90">
                <span className="text-sm font-medium">{p.name}</span>
                <button onClick={() => setPlayers(players.filter(x => x.id !== p.id))} className="text-slate-500 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            ))}
            {players.length === 0 && <p className="text-slate-600 text-sm italic w-full text-center py-4">Add at least 2 players to start</p>}
          </div>
        </Card>
        <div className="space-y-3">
          <Button onClick={() => setStep('spinning')} disabled={players.length < 2}>Start Game</Button>
          <Button variant="outline" onClick={onBack}>Quit to Menu</Button>
        </div>
      </div>
    );
  }

  if (step === 'spinning') {
    return (
      <div className="flex flex-col items-center gap-8 py-10 animate-in fade-in duration-500">
        <BackButton onClick={() => setStep('setup')} />
        <div className="text-center">
          <h2 className="text-2xl font-black text-white italic tracking-widest">SPIN THE BOTTLE</h2>
          <p className="text-slate-500 text-xs uppercase mt-1">Who will be next?</p>
        </div>

        <div className="relative w-80 h-80 border-8 border-slate-900 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Players in a circle */}
          {players.map((p, i) => {
            const angle = (i / players.length) * 360;
            const isActive = playerHistory[playerHistory.length - 1] === p.id && !currentPlayer;
            return (
              <div key={p.id} className="absolute transition-all duration-500" style={{ transform: `rotate(${angle}deg) translateY(-135px)` }}>
                <div 
                  className={`px-3 py-1 rounded-lg text-sm font-bold border-2 transition-all duration-300 ${isActive ? 'bg-indigo-600 border-indigo-400 scale-125 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'bg-slate-800 border-slate-700 text-slate-300'}`}
                  style={{ transform: `rotate(-${angle}deg)` }}
                >
                  {p.name}
                </div>
              </div>
            );
          })}

          {/* Center Bottle */}
          <div 
            className="w-5 h-40 bg-gradient-to-b from-emerald-400 via-emerald-600 to-emerald-800 rounded-full shadow-2xl border-2 border-emerald-300/30 relative transition-transform duration-[3.2s] cubic-bezier(0.15, 0, 0.15, 1)" 
            style={{ transform: `rotate(${bottleRotation}deg)`, transformOrigin: 'center 50%' }}
          >
            <div className="absolute top-0 w-full h-6 bg-emerald-200 rounded-full shadow-inner" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1.5 h-20 bg-white/10 rounded-full" />
          </div>
          
          {/* Center Point */}
          <div className="absolute w-4 h-4 bg-slate-950 rounded-full border-2 border-slate-800 z-10" />
        </div>

        <div className="w-full space-y-3">
          <Button onClick={spin}>SPIN!</Button>
          <Button variant="outline" onClick={onBack}>Exit Game</Button>
        </div>
      </div>
    );
  }

  if (step === 'selection') {
    return (
      <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
        <div className="space-y-1">
          <p className="text-indigo-400 text-sm font-bold tracking-widest uppercase">The bottle chose</p>
          <h2 className="text-5xl font-black italic text-white drop-shadow-lg">{currentPlayer.name.toUpperCase()}</h2>
        </div>
        <Card className="space-y-4 bg-slate-900/50 backdrop-blur-md border-slate-700">
          <Button variant="truth" onClick={() => getQuestion('TRUTH')}>Truth</Button>
          <Button variant="dare" onClick={() => getQuestion('DARE')}>Dare</Button>
          <Button variant="ai" onClick={getAiDare} loading={loading}>AI Dare ✨</Button>
        </Card>
        <Button variant="outline" onClick={onBack}>Quit Game</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4">
      <Card className="text-center min-h-[250px] flex flex-col justify-center gap-6 border-indigo-500/30 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="space-y-1">
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-[10px] font-black tracking-[0.2em] text-indigo-400 border border-indigo-500/20 uppercase">
            {result.type}
          </span>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{currentPlayer.name}'s Challenge</p>
        </div>
        <p className="text-2xl font-bold leading-tight text-white px-2">"{result.text}"</p>
      </Card>
      <div className="space-y-3">
        <Button onClick={() => setStep('spinning')}>Next Turn</Button>
        <Button variant="outline" onClick={onBack}>Return to Menu</Button>
      </div>
    </div>
  );
}

// --- NHIE & WYR (Simplified for localhost demo) ---
function NhieGame({ onBack }) {
  const [step, setStep] = useState('setup'); // setup | spinning | playing
  const [players, setPlayers] = useState([]);
  const [nameInput, setNameInput] = useState('');
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerHistory, setPlayerHistory] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answeredPlayers, setAnsweredPlayers] = useState([]);

  // Add player
  const addPlayer = () => {
    if (!nameInput.trim()) return;
    setPlayers(prev => [
      ...prev,
      { id: Date.now(), name: nameInput.trim(), fingers: 5 }
    ]);
    setNameInput('');
  };

  // Pick next player fairly
  const pickNextPlayer = () => {
    if (players.length === 0) return;

    const unplayed = players.filter(p => !playerHistory.includes(p.id));
    const pool = unplayed.length ? unplayed : players;
    const history = unplayed.length ? playerHistory : [];

    const picked = pool[Math.floor(Math.random() * pool.length)];
    setCurrentPlayer(picked);
    setPlayerHistory([...history, picked.id]);
    setAnsweredPlayers([]);
    setStep('playing');
  };

  // Reduce finger when player says "I HAVE"
  const handleHave = (playerId) => {
    if (answeredPlayers.includes(playerId)) return;

    setPlayers(prev =>
      prev.map(p =>
        p.id === playerId
          ? { ...p, fingers: Math.max(0, p.fingers - 1) }
          : p
      )
    );

    setAnsweredPlayers(prev => [...prev, playerId]);
  };

  // Move to next question & turn
  const nextTurn = () => {
    setQuestionIndex(q => (q + 1) % allNhieQuestions.length);
    setStep('spinning');
  };

  /* ---------------- SETUP SCREEN ---------------- */
  if (step === 'setup') {
    return (
      <div className="space-y-6">
        <BackButton onClick={onBack} />
        <Card>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="text-indigo-400" /> Players
          </h2>

          <div className="flex gap-2 mb-4">
            <input
              className="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl outline-none"
              placeholder="Enter name"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addPlayer()}
            />
            <button
              onClick={addPlayer}
              className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500"
            >
              <Plus />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {players.map(p => (
              <div
                key={p.id}
                className="bg-slate-800 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {p.name}
              </div>
            ))}
            {players.length === 0 && (
              <p className="text-slate-500 text-sm italic">
                Add at least 2 players
              </p>
            )}
          </div>
        </Card>

        <Button disabled={players.length < 2} onClick={() => setStep('spinning')}>
          Start Game
        </Button>

        <Button variant="outline" onClick={onBack}>
          Quit to Menu
        </Button>
      </div>
    );
  }

  /* ---------------- SPINNING (PICK PLAYER) ---------------- */
  if (step === 'spinning') {
    setTimeout(pickNextPlayer, 400);
    return (
      <div className="text-center space-y-4">
        <BackButton onClick={onBack} />
        <p className="text-slate-400 uppercase tracking-widest text-sm">
          Picking next player...
        </p>
      </div>
    );
  }

  /* ---------------- PLAYING ---------------- */
  const question = allNhieQuestions[questionIndex];

  return (
    <div className="space-y-6 text-center">
      <BackButton onClick={onBack} />

      <p className="text-indigo-400 text-sm uppercase tracking-widest">
        {currentPlayer.name} reads
      </p>

      <Card>
        <p className="text-2xl font-bold">{question.text}</p>
      </Card>

      <div className="space-y-2">
        {players.map(p => (
          <Button
            key={p.id}
            variant="danger"
            disabled={answeredPlayers.includes(p.id)}
            onClick={() => handleHave(p.id)}
          >
            {p.name} — I HAVE 🍷 ({p.fingers})
          </Button>
        ))}
      </div>

      <Button onClick={nextTurn}>Next Turn</Button>
    </div>
  );
}


function WyrGame({ onBack }) {
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(null);
  const q = allWyrQuestions[index];

  const handleNext = () => {
    setIndex((index + 1) % allWyrQuestions.length);
    setAnswered(null);
  };

  return (
    <div className="space-y-8 h-full flex flex-col justify-center animate-in fade-in">
      <BackButton onClick={onBack} />
      <div className="text-center space-y-1">
        <h2 className="text-4xl font-black italic tracking-tighter text-indigo-500 uppercase">Would You Rather</h2>
      </div>
      <div className="space-y-4 relative">
        <WyrButton text={q.optionA} active={answered === 'A'} otherActive={answered === 'B'} onClick={() => setAnswered('A')} percent={42} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 text-sm font-black z-10 shadow-lg">OR</div>
        <WyrButton text={q.optionB} active={answered === 'B'} otherActive={answered === 'A'} onClick={() => setAnswered('B')} percent={58} />
      </div>
      <div className="space-y-3">
        {answered && <Button onClick={handleNext}>Next Question <ChevronRight /></Button>}
        <Button variant="outline" onClick={onBack}>Quit Game</Button>
      </div>
    </div>
  );
}

function WyrButton({ text, active, otherActive, onClick, percent }) {
  return (
    <button onClick={onClick} disabled={active || otherActive} className={`w-full relative overflow-hidden p-8 rounded-3xl border-2 transition-all text-left flex flex-col justify-center min-h-[140px] ${active ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800 bg-slate-900'} ${otherActive ? 'opacity-50 grayscale scale-95' : 'hover:border-slate-600'}`}>
      <div className="relative z-10 flex justify-between items-center w-full">
        <p className={`text-xl font-bold leading-tight max-w-[80%] ${active ? 'text-white' : 'text-slate-300'}`}>{text}</p>
        {(active || otherActive) && <span className="text-3xl font-black italic opacity-20">{percent}%</span>}
      </div>
      {(active || otherActive) && <div className="absolute inset-y-0 left-0 bg-indigo-500/20 transition-all duration-1000" style={{ width: `${percent}%` }} />}
    </button>
  );
}