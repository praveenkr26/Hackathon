import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { schemeAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/i18n';
import useSpeech from '../hooks/useSpeech';
import './SchemeDetail.css';

const CATEGORY_ICONS = {
  education: '🎓', health: '🏥', agriculture: '🌾', housing: '🏠',
  employment: '💼', 'social-welfare': '🤝', 'women-empowerment': '👩',
  'skill-development': '⚡', 'financial-inclusion': '💳',
  'senior-citizen': '👴', disability: '♿', 'tribal-welfare': '🌿'
};

const CATEGORY_IMAGES = {
  education: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
  health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=600&auto=format&fit=crop',
  agriculture: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop',
  housing: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=600&auto=format&fit=crop',
  employment: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop',
  'social-welfare': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop',
  'women-empowerment': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
  'skill-development': 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=600&auto=format&fit=crop',
  'financial-inclusion': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=600&auto=format&fit=crop',
  'senior-citizen': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
  disability: 'https://images.unsplash.com/photo-1531206715517-5c0ba140e2b8?q=80&w=600&auto=format&fit=crop',
  'tribal-welfare': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=600&auto=format&fit=crop'
};

const formatAmount = (amount) => {
  if (!amount) return null;
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
};

const TRANSLATIONS = {
  hi: {
    // Labels
    'age': 'आयु सीमा',
    'gender': 'लिंग',
    'incomelimit': 'पारिवारिक आय सीमा',
    'category': 'श्रेणी',
    'states': 'राज्य (भौगोलिक क्षेत्र)',
    'occupation': 'व्यवसाय',
    'years': 'वर्ष',
    'all': 'सभी नागरिक (महिला, पुरुष और अन्य)',
    'male': 'केवल पुरुष लाभार्थी',
    'female': 'केवल महिला लाभार्थी',
    'other': 'अन्य',
    'annual': 'वार्षिक',
    'monthly': 'मासिक',
    'quarterly': 'त्रैमासिक',
    'one-time': 'एक बार',
    'requiredDocuments': 'आवश्यक दस्तावेज',
    'areYouEligible': 'क्या आप पात्र हैं?',
    'checkEligibilityDesc': 'यह जांचने के लिए कि क्या आप इस और अन्य योजनाओं के लिए पात्र हैं, हमारे स्मार्ट मैचिंग टूल का उपयोग करें।',
    'checkEligibilityBtn': 'पात्रता की जांच करें',
    'whatIsIt': 'यह योजना क्या है?',
    'whyIsItHere': 'योजना के उद्देश्य और लाभ',
    'howToApply': 'आवेदन प्रक्रिया और आवश्यक दस्तावेज',
    'deadlineLabel': 'आवेदन की अंतिम तिथि',
    'noDeadline': 'कोई अंतिम तिथि तय नहीं है (सक्रिय)',
    'helpline': 'हेल्पलाइन नंबर',
    
    // Caste Categories
    'sc': 'अनुसूचित जाति (SC)',
    'st': 'अनुसूचित जनजाति (ST)',
    'obc': 'अन्य पिछड़ा वर्ग (OBC)',
    'general': 'सामान्य वर्ग (General)',
    
    // Occupations
    'farmer': 'किसान (कृषक)',
    'student': 'छात्र (विद्यार्थी)',
    'unemployed': 'बेरोजगार युवा',
    'self-employed': 'स्वरोजगार (व्यवसायी)',
    'employed': 'नौकरीपेशा (कर्मचारी)',
    
    // Documents
    'aadhaar card': 'आधार कार्ड',
    'bank passbook': 'बैंक पासबुक',
    'land records (khasra/khatauni)': 'भूमि रिकॉर्ड (खसरा/खतौनी)',
    'mobile number': 'सक्रिय मोबाइल नंबर',
    'income certificate': 'आय प्रमाण पत्र',
    'caste certificate': 'जाति प्रमाण पत्र',
    'passport size photo': 'पासपोर्ट आकार की फोटो',
    'passport size photograph': 'पासपोर्ट आकार की फोटो',
    'passport size photos': 'पासपोर्ट आकार की फोटो',
    'ration card': 'राशन कार्ड',
    'domicile certificate': 'मूल निवास प्रमाण पत्र',
    'identity proof': 'पहचान प्रमाण पत्र',
    'address proof': 'पते का प्रमाण पत्र',
    'voter id': 'मतदाता पहचान पत्र (वोटर आईडी)',
    'pan card': 'पैन कार्ड',
    'driving license': 'ड्राइविंग लाइसेंस',
    'birth certificate': 'जन्म प्रमाण पत्र',
    'school leaving certificate': 'स्कूल छोड़ने का प्रमाण पत्र',
    'marksheets': 'अंकतालिका (मार्कशीट)',
    'disability certificate': 'दिव्यांगता प्रमाण पत्र',
    'self-declaration form': 'स्व-घोषणा पत्र',
    'age proof': 'आयु प्रमाण पत्र',
    'bank account': 'बैंक खाता विवरण',
    'property documents': 'संपत्ति के दस्तावेज',
    'bank statement': 'बैंक स्टेटमेंट',
    'affidavit': 'शपथ पत्र (हलफनामा)',
    'bpl certificate': 'बीपीएल प्रमाण पत्र',
    'land ownership proof': 'भूमि स्वामित्व प्रमाण',
    
    // Tags
    'income support': 'आय सहायता',
    'agriculture': 'कृषि',
    'dbt': 'डीबीटी',
    'rural': 'ग्रामीण',
    'kisan': 'किसान',
    'women': 'महिला',
    'lpg': 'एलपीजी गैस',
    'cooking gas': 'रसोई गैस',
    'bpl': 'बीपीएल (गरीबी रेखा से नीचे)',
    'health': 'स्वास्थ्य सुरक्षा',
    'ujjwala': 'उज्ज्वला',
    'health insurance': 'स्वास्थ्य बीमा',
    'hospital': 'अस्पताल',
    'cashless': 'कैशलेस',
    'ayushman': 'आयुष्मान',
    'medical': 'चिकित्सा',
    'housing': 'आवास',
    'home loan': 'गृह ऋण',
    'subsidy': 'सब्सिडी (अनुदान)',
    'urban': 'शहरी क्षेत्र',
    'affordable housing': 'सस्ता आवास',
    'gramin': 'ग्रामीण क्षेत्र',
    'pucca house': 'पक्का मकान',
    'construction': 'मकान निर्माण',
    'self employment': 'स्वरोजगार',
    'loans': 'ऋण योजनाएं',
    'business': 'व्यवसाय',
    'mudra': 'मुद्रा योजना',
    'collateral free': 'बिना गारंटी का ऋण',
    
    // Benefit Types
    'financial': 'वित्तीय सहायता',
    'scholarship': 'छात्रवृत्ति',
    'insurance': 'बीमा सुरक्षा',
    'employment': 'रोजगार गारंटी',
    'pension': 'पेंशन योजना',
    'loan': 'कम ब्याज ऋण',
    
    // Common scheme benefits
    'annual direct income support of ₹6,000 paid in three ₹2,000 installments': '₹6,000 की वार्षिक प्रत्यक्ष आय सहायता, जो तीन ₹2,000 की समान किस्तों में सीधे बैंक खाते में भुगतान की जाती है।',
    'free lpg connection, first refill free, hotplate free — total benefit ~₹3,200': 'मुफ्त एलपीजी गैस कनेक्शन, पहली गैस रिफिल मुफ्त और गैस चूल्हा मुफ्त - कुल लाभ लगभग ₹3,200',
    'cashless health coverage of ₹5 lakh per family per year for secondary and tertiary care': 'माध्यमिक और तृतीयक स्तर की चिकित्सा के लिए प्रति परिवार प्रति वर्ष ₹5 लाख का कैशलेस स्वास्थ्य बीमा कवरेज',
    'interest subsidy up to ₹2.67 lakh for ews/lig on home loans up to ₹6 lakh': '₹6 लाख तक के गृह ऋण पर ईडब्ल्यूएस (EWS) और एलआईजी (LIG) श्रेणियों के लिए ₹2.67 लाख तक की ब्याज सब्सिडी',
    '₹1.20 lakh in plains, ₹1.30 lakh in hilly/ne states for house construction': 'मकान निर्माण के लिए मैदानी क्षेत्रों में ₹1.20 lakh और पहाड़ी/पूर्वोत्तर राज्यों में ₹1.30 lakh की वित्तीय सहायता',
    'free food grains (5kg wheat/rice per person per month) to bpl families': 'बीपीएल परिवारों को मुफ्त खाद्यान्न (प्रति व्यक्ति प्रति माह 5 किलोग्राम गेहूं या चावल) का वितरण',
    '100 days of guaranteed wage employment per financial year to rural households': 'ग्रामीण परिवारों को प्रत्येक वित्तीय वर्ष में 100 दिनों के गारंटीकृत मजदूरी रोजगार की सुरक्षा',
    'financial assistance of ₹10,000 for purchasing cycles/laptops or educational aids': 'साइकिल, लैपटॉप या अन्य शैक्षिक उपकरण खरीदने के लिए ₹10,000 की एकमुश्त वित्तीय सहायता',
    'subsidy of 50% or up to ₹50,000 on purchase of agricultural equipment or seeds': 'कृषि उपकरण या उच्च गुणवत्ता वाले बीजों की खरीद पर 50% या ₹50,000 तक की विशेष सब्सिडी',
    'monthly pension of ₹3,000 for citizens aged 60 and above after retirement': '60 वर्ष और उससे अधिक आयु के नागरिकों के लिए सेवानिवृत्ति के बाद ₹3,000 की मासिक सामाजिक पेंशन',
    'scholarship up to ₹50,000 per year covering tuition fees and academic expenses': 'ट्यूशन फीस और शैक्षणिक खर्चों को कवर करने के लिए प्रति वर्ष ₹50,000 तक की छात्रवृत्ति',
    'monthly stipend of ₹1,000 for post-matric students from marginalized sections': 'हाशिए के वर्गों के पोस्ट-मैट्रिक छात्रों के लिए ₹1,000 प्रति माह का मासिक छात्रवृत्ति वजीफा',
    'one-time financial assistance of ₹51,000 for daughters of bpl families': 'बीपीएल परिवारों की बेटियों की शिक्षा और विवाह के लिए ₹51,000 की एकमुश्त वित्तीय सहायता',
    'free training, certification, and stipend of ₹8,000 for skill development': 'कौशल विकास के लिए मुफ्त प्रशिक्षण, सरकारी प्रमाणन और ₹8,000 का मासिक मानदेय वजीफा'
  },
  en: {
    'age': 'Age Limit',
    'gender': 'Gender',
    'incomelimit': 'Family Income Limit',
    'category': 'Category',
    'states': 'States Covered',
    'occupation': 'Occupation',
    'years': 'years',
    'all': 'All Genders (Male/Female/Other)',
    'male': 'Males Only',
    'female': 'Females Only',
    'other': 'Other',
    'annual': 'Annual',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'one-time': 'One-Time',
    'requiredDocuments': 'Required Documents',
    'areYouEligible': 'Are You Eligible?',
    'checkEligibilityDesc': 'Use our smart matching tool to check if you qualify for this and other schemes.',
    'checkEligibilityBtn': 'Check Eligibility',
    'whatIsIt': 'What is this Scheme?',
    'whyIsItHere': 'Scheme Objectives & Benefits',
    'howToApply': 'How to Apply & Required Documents',
    'deadlineLabel': 'Apply Until (Deadline)',
    'noDeadline': 'No fixed deadline (Active)',
    'helpline': 'Helpline Number'
  }
};

const translateText = (text, lang) => {
  if (!text) return '';
  if (lang !== 'hi') return text;
  const clean = text.toLowerCase().trim();
  
  // Direct lookup
  if (TRANSLATIONS.hi[clean]) {
    return TRANSLATIONS.hi[clean];
  }
  
  // Try substring lookup
  for (const [key, val] of Object.entries(TRANSLATIONS.hi)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }

  // Fallback word replacement
  let translated = text;
  const wordDict = {
    'Aadhaar Card': 'आधार कार्ड',
    'Bank Passbook': 'बैंक पासबुक',
    'Land Records': 'भूमि रिकॉर्ड',
    'Mobile Number': 'सक्रिय मोबाइल नंबर',
    'Income Certificate': 'आय प्रमाण पत्र',
    'Caste Certificate': 'जाति प्रमाण पत्र',
    'Passport Size Photo': 'पासपोर्ट आकार की फोटो',
    'Ration Card': 'राशन कार्ड',
    'Domicile Certificate': 'मूल निवास प्रमाण पत्र',
    'Identity Proof': 'पहचान प्रमाण पत्र',
    'Address Proof': 'पते का प्रमाण पत्र',
    'Voter ID': 'मतदाता पहचान पत्र (वोटर आईडी)',
    'PAN Card': 'पैन कार्ड',
    'BPL Ration Card': 'बीपीएल राशन कार्ड',
    'Bank Account': 'बैंक खाता',
    'Property Documents': 'संपत्ति के दस्तावेज',
    'Bank Statement': 'बैंक स्टेटमेंट',
    'Affidavit': 'हलफनामा'
  };
  
  for (const [eng, hin] of Object.entries(wordDict)) {
    const regex = new RegExp(eng, 'gi');
    if (regex.test(translated)) {
      translated = translated.replace(regex, hin);
    }
  }
  
  return translated;
};

const getDetailedContent = (scheme, lang) => {
  const isHi = lang === 'hi';
  const name = isHi && scheme.nameHindi ? scheme.nameHindi : scheme.name;
  const min = scheme.ministry;
  
  if (isHi) {
    return {
      intro: `दोस्तों, आज हम बात करने जा रहे हैं "${name}" के बारे में। अगर आप एक सरल और सीधी भाषा में समझना चाहते हैं, तो आपको बता दें कि यह योजना भारत सरकार के ${min} द्वारा चलाई जाने वाली एक बहुत ही कमाल की और मददगार योजना है। इस योजना को शुरू करने के पीछे सरकार की सोच यह है कि सीधे आप तक बिना किसी रुकावट के वित्तीय और सामाजिक मदद पहुंचाई जा सके। ${scheme.launchYear ? `इसकी शुरुआत साल ${scheme.launchYear} में की गई थी और तब से यह देश भर में लाखों लोगों के जीवन में सकारात्मक बदलाव ला रही है।` : 'यह योजना इस समय पूरे देश में पूरी तरह से लागू है और लगातार लोगों की मदद कर रही है।'} सबसे अच्छी बात यह है कि इसमें कोई बिचौलिया नहीं होता, सारा काम सीधे आपके खाते के जरिए होता है।`,
      
      objectives: `आखिर इस योजना से आपको क्या-क्या मिलने वाला है और इसके पीछे सरकार का क्या लक्ष्य है? आइए इसे आसान शब्दों में समझते हैं। सरकार चाहती है कि समाज का हर वर्ग आत्मनिर्भर बने। इस योजना के अंतर्गत मिलने वाले खास फायदे इस प्रकार हैं:
      ${scheme.benefits && scheme.benefits.length > 0 ? scheme.benefits.map((b, i) => `- ${translateText(b.description, 'hi')} ${b.amount ? `(लगभग ₹${b.amount.toLocaleString()} - ${b.frequency === 'monthly' ? 'हर महीने' : b.frequency === 'annually' ? 'हर साल' : 'एक बार में'})` : ''}`).join('\n') : '- जरूरतमंद लाभार्थियों को उनकी श्रेणी के अनुसार आवश्यक वित्तीय अनुदान या संसाधन दिए जाते हैं।'}
      यह योजना केवल कुछ समय की मदद नहीं है, बल्कि यह आपको और आपके पूरे परिवार को भविष्य में आर्थिक रूप से मजबूत बनाने की एक बेहतरीन कोशिश है।`,
      
      eligibility: `अब आप सोच रहे होंगे कि क्या आप भी इस योजना का फायदा उठा सकते हैं? तो इसके लिए सरकार ने कुछ आसान नियम तय किए हैं। आइए जानते हैं कि कौन-कौन इसके पात्र हैं:
      - उम्र की सीमा: आपकी आयु ${scheme.eligibility?.minAge || 0} से ${scheme.eligibility?.maxAge || 100} वर्ष के बीच होनी चाहिए।
      - लिंग: यह लाभ ${scheme.eligibility?.gender === 'all' ? 'सभी नागरिकों (पुरुष और महिला दोनों)' : scheme.eligibility?.gender === 'female' ? 'विशेष रूप से केवल महिलाओं' : 'केवल पुरुषों'} के लिए उपलब्ध है।
      - सालाना आय: आपके परिवार की सालाना आय ${scheme.eligibility?.incomeLimit ? `₹${scheme.eligibility.incomeLimit.toLocaleString()} से कम` : 'सरकार द्वारा तय की गई सीमा के भीतर'} होनी चाहिए।
      - जाति व राज्य: यह योजना ${scheme.eligibility?.caste?.includes('all') ? 'सभी सामाजिक श्रेणियों' : scheme.eligibility?.caste?.map(c => TRANSLATIONS.hi[c.toLowerCase()] || c.toUpperCase()).join(', ')} के लिए तथा ${scheme.eligibility?.states?.includes('all') ? 'पूरे देश' : scheme.eligibility?.states?.join(', ')} में लागू है।`,
      
      apply: `तो अगर आप इसके लिए अप्लाई करना चाहते हैं, तो आपके पास कुछ जरूरी कागज होने चाहिए। आइए एक बार नीचे दी गई लिस्ट देख लें:
      ${scheme.documents && scheme.documents.length > 0 ? scheme.documents.map((d, i) => `- ${translateText(d, 'hi')}`).join('\n') : '- पहचान पत्र, आधार कार्ड, निवास प्रमाण पत्र, बैंक पासबुक और चालू मोबाइल नंबर।'}

      आवेदन करने का तरीका बहुत आसान है:
      1. सबसे पहले अपने कागजातों के साथ पास के कॉमन सर्विस सेंटर (CSC) या संबंधित विभाग के दफ्तर में जाएं।
      2. वहां से फॉर्म लेकर अपनी पूरी जानकारी बिल्कुल सही-सही भरें।
      3. फॉर्म के साथ अपने सभी कागजातों की फोटोकॉपी साइन करके लगा दें।
      4. फॉर्म जमा करने के बाद रसीद जरूर लें। जैसे ही अधिकारी आपके फॉर्म की जांच पूरी करेंगे, पैसा सीधे आपके बैंक खाते में आ जाएगा।`,
      
      deadline: `कुछ जरूरी बातें जो आपको हमेशा ध्यान रखनी चाहिए:
      - आखिरी तारीख: ${scheme.deadline ? `इस योजना में फॉर्म भरने की अंतिम तिथि ${new Date(scheme.deadline).toLocaleDateString('hi-IN')} है, इसलिए समय से पहले आवेदन कर लें।` : 'इसमें फॉर्म भरने की कोई आखिरी तारीख नहीं है, यह पूरे साल चालू रहती है।'}
      - हेल्पलाइन: ${scheme.helplineNumber ? `अगर आपको कोई भी समस्या आती है या जानकारी चाहिए, तो आप टोल-फ्री नंबर ${scheme.helplineNumber} पर कॉल करके सीधे मदद ले सकते हैं।` : 'आप अपने जिले के समाज कल्याण विभाग में जाकर भी इसकी जानकारी ले सकते हैं।'}
      - ध्यान दें: सरकारी योजनाओं में आवेदन करना पूरी तरह से मुफ्त और पारदर्शी है, किसी भी दलाल को पैसे न दें।`
    };
  } else {
    return {
      intro: `Hello readers! Today, let's take a close look at how "${name}" can make a real difference in your life. Run by the ${min}, Government of India, this welfare initiative is designed to provide direct financial and social support to those who need it most. ${scheme.launchYear ? `Launched in the year ${scheme.launchYear}, it has been empowering citizens across the nation ever since.` : 'The scheme is currently open and active in all regions of India.'} With a clear focus on transparency, the government ensures that benefits reach you directly via Direct Benefit Transfer (DBT), cuting out any middle agents.`,
      
      objectives: `Wondering what benefits are in store for you? Let's break down how this scheme supports your livelihood. Here are the core benefits you can receive:
      ${scheme.benefits && scheme.benefits.length > 0 ? scheme.benefits.map((b, i) => `- ${b.description} ${b.amount ? `(amounting to ₹${b.amount.toLocaleString()} paid ${b.frequency === 'monthly' ? 'monthly' : b.frequency === 'annually' ? 'annually' : 'one-time'})` : ''}`).join('\n') : '- Direct financial grants or subsidized resources custom-fitted to your needs.'}
      The main goal here is to give families the tools and stability they need to stand on their own feet, purchase seeds, secure healthcare, or pay for education without taking on heavy debt.`,
      
      eligibility: `Can you apply for this scheme? Let's check the simple checklist to see if you qualify:
      - Age Group: You must be between ${scheme.eligibility?.minAge || 0} and ${scheme.eligibility?.maxAge || 100} years old.
      - Gender: Available for ${scheme.eligibility?.gender === 'all' ? 'all genders' : scheme.eligibility?.gender === 'female' ? 'females only' : 'males only'}.
      - Family Income: The combined annual household income should be ${scheme.eligibility?.incomeLimit ? `below ₹${scheme.eligibility.incomeLimit.toLocaleString()}` : 'within standard eligibility limits'}.
      - Caste & Region: Open to ${scheme.eligibility?.caste?.includes('all') ? 'all communities' : scheme.eligibility?.caste?.join(', ').toUpperCase()} in ${scheme.eligibility?.states?.includes('all') ? 'all states across India' : scheme.eligibility?.states?.join(', ')}.`,
      
      apply: `If you qualify, here is the list of key documents you should prepare before applying:
      ${scheme.documents && scheme.documents.length > 0 ? scheme.documents.map((d, i) => `- ${d}`).join('\n') : '- Aadhaar Card, identity proof, address proof, bank passbook, and a working mobile number.'}

      Here is the step-by-step application walkthrough:
      1. Visit your nearest Common Service Centre (CSC) or local administrative office with your documents.
      2. Ask for the registration form and fill it out carefully.
      3. Attach self-attested photocopies of all documents from the checklist.
      4. Submit the form and get your tracking receipt. Once verified by local officers, your benefits will start arriving directly in your bank account.`,
      
      deadline: `Important dates and helpline numbers to keep handy:
      - Application Deadline: ${scheme.deadline ? `Make sure to register before the closing date on ${new Date(scheme.deadline).toLocaleDateString('en-US')}.` : 'There is no fixed deadline; applications are accepted throughout the year.'}
      - Helpline Support: ${scheme.helplineNumber ? `If you face any issues during registration, dial the official toll-free helpline at ${scheme.helplineNumber}.` : 'You can contact your local block or district office for direct support.'}
      - Remember: Applying is completely free and transparent. Do not pay any brokers or unauthorized agencies.`
    };
  }
};

const SchemeDetail = () => {
  const { id } = useParams();
  const { language } = useLanguage();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const { speak, stop, isSpeaking } = useSpeech();

  useEffect(() => {
    return () => {
      stop(); // Stop speaking when navigating away
    };
  }, [stop]);

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
      return;
    }

    const detail = getDetailedContent(scheme, language);
    const script = `${detail.intro} ${detail.objectives} ${detail.eligibility} ${detail.apply} ${detail.deadline}`;
    speak(script);
  };

  useEffect(() => {
    const fetchScheme = async () => {
      setLoading(true);
      try {
        const res = await schemeAPI.getById(id);
        setScheme(res?.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchScheme();
    window.scrollTo(0, 0);
  }, [id]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div className="detail-page">
      <div className="detail-skeleton">
        <div className="skeleton" style={{ height: '280px' }} />
        <div className="container" style={{ paddingTop: '2rem' }}>
          <div className="skeleton" style={{ height: '24px', width: '40%', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '40px', width: '70%', marginBottom: '1rem' }} />
          <div className="skeleton" style={{ height: '80px', marginBottom: '1.5rem' }} />
        </div>
      </div>
    </div>
  );

  if (error || !scheme) return (
    <div className="detail-page">
      <div className="detail-error container">
        <div className="error-icon">⚠️</div>
        <h2>{language === 'hi' ? 'योजना नहीं मिली' : 'Scheme Not Found'}</h2>
        <p>{error || (language === 'hi' ? 'यह योजना उपलब्ध नहीं है या इसे लोड नहीं किया जा सका।' : 'This scheme does not exist or could not be loaded.')}</p>
        <Link to="/schemes" className="btn btn-primary">
          {language === 'hi' ? '← योजनाओं पर वापस जाएं' : '← Back to Schemes'}
        </Link>
      </div>
    </div>
  );

  const catIcon = CATEGORY_ICONS[scheme.category] || '📋';
  const detail = getDetailedContent(scheme, language);

  return (
    <div className="detail-page page-enter">
      {/* Hero */}
      <div className="detail-hero">
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb animate-fade-in-down">
            <Link to="/">{language === 'hi' ? 'होम' : 'Home'}</Link>
            <span>›</span>
            <Link to="/schemes">{language === 'hi' ? 'योजनाएं' : 'Schemes'}</Link>
            <span>›</span>
            <span>{language === 'hi' && scheme.nameHindi ? scheme.nameHindi : scheme.name}</span>
          </div>

          <div className="detail-hero-content animate-fade-in-up">
            <div className="detail-hero-left">
              <div className="detail-hero-meta">
                <span className="badge badge-primary detail-cat-badge">
                  {t(language, `categories.${scheme.category}`)}
                </span>
                <span className={`badge ${scheme.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {t(language, `card.${scheme.status}`)}
                </span>
                {scheme.featured && <span className="badge badge-warning">⭐ Featured</span>}
              </div>

              <h1 className="detail-title">
                {language === 'hi' && scheme.nameHindi ? scheme.nameHindi : scheme.name}
              </h1>
              {language === 'hi' && scheme.nameHindi && (
                <p className="detail-name-en">{scheme.name}</p>
              )}

              <p className="detail-ministry">
                <span>🏛</span> {scheme.ministry}
                {scheme.launchYear && <span className="detail-year">• Est. {scheme.launchYear}</span>}
              </p>

              <div className="detail-actions">
                {scheme.applicationUrl && (
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg"
                    id="apply-now-btn"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {language === 'hi' ? 'ऑनलाइन आवेदन करें' : 'Apply Online'}
                  </a>
                )}
                <button
                  className={`btn btn-lg ${isSpeaking ? 'btn-danger' : 'btn-hero-ghost'}`}
                  onClick={handleReadAloud}
                  id="tts-read-btn"
                >
                  {isSpeaking ? (language === 'hi' ? '⏹ बंद करें' : '⏹ Stop Guide') : (language === 'hi' ? '🔊 सुनें' : '🔊 Listen')}
                </button>
                <button className="btn btn-hero-ghost btn-lg" onClick={copyLink} id="copy-link-btn">
                  {copied ? (language === 'hi' ? '✅ कॉपी किया गया!' : '✅ Copied!') : (language === 'hi' ? '🔗 साझा करें' : '🔗 Share')}
                </button>
                {scheme.helplineNumber && (
                  <a href={`tel:${scheme.helplineNumber}`} className="btn btn-hero-ghost btn-lg" id="helpline-btn">
                    📞 {scheme.helplineNumber}
                  </a>
                )}
              </div>
            </div>
            <div className="detail-hero-right">
              <img
                src={CATEGORY_IMAGES[scheme.category] || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600'}
                alt={scheme.name}
                className="detail-hero-image"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container detail-content">
        <div className="detail-grid">
          {/* Main */}
          <div className="detail-main">
            {/* Description */}
            <section className="detail-section animate-fade-in-up">
              <h2 className="detail-section-title">
                📖 {language === 'hi' ? TRANSLATIONS.hi.whatIsIt : TRANSLATIONS.en.whatIsIt}
              </h2>
              <p className="detail-desc" style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.05rem' }}>
                {detail.intro}
              </p>
            </section>

            {/* Benefits */}
            {scheme.benefits?.length > 0 && (
              <section className="detail-section animate-fade-in-up delay-100">
                <h2 className="detail-section-title">
                  🎯 {language === 'hi' ? TRANSLATIONS.hi.whyIsItHere : TRANSLATIONS.en.whyIsItHere}
                </h2>
                <p className="detail-desc" style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
                  {detail.objectives}
                </p>
                <div className="benefits-grid">
                  {scheme.benefits.map((benefit, i) => (
                    <div key={i} className="benefit-card">
                      <div className="benefit-header">
                        <span className="benefit-type">
                          {language === 'hi' ? (TRANSLATIONS.hi[benefit.type.toLowerCase()] || benefit.type) : benefit.type}
                        </span>
                        {benefit.amount && (
                          <span className="benefit-amount-large">{formatAmount(benefit.amount)}</span>
                        )}
                      </div>
                      <p className="benefit-desc">{translateText(benefit.description, language)}</p>
                      {benefit.frequency && (
                        <span className="benefit-freq badge badge-info">
                          {language === 'hi' ? (TRANSLATIONS.hi[benefit.frequency.toLowerCase()] || benefit.frequency) : benefit.frequency}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Application Process */}
            <section className="detail-section animate-fade-in-up delay-200">
              <h2 className="detail-section-title">
                📋 {language === 'hi' ? TRANSLATIONS.hi.howToApply : TRANSLATIONS.en.howToApply}
              </h2>
              <div className="detail-desc" style={{ whiteSpace: 'pre-line', lineHeight: '1.8', fontSize: '1.05rem' }}>
                {detail.apply}
              </div>
              {scheme.applicationUrl && (
                <div style={{ marginTop: '1.5rem' }}>
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    id="apply-link-btn"
                    style={{ display: 'inline-flex' }}
                  >
                    {language === 'hi' ? 'आधिकारिक पोर्टल पर जाएं →' : 'Go to Official Portal →'}
                  </a>
                </div>
              )}
            </section>

            {/* Tags */}
            {scheme.tags?.length > 0 && (
              <section className="detail-section animate-fade-in-up delay-300">
                <h2 className="detail-section-title">🏷 Tags</h2>
                <div className="tags-wrap">
                  {scheme.tags.map(tag => (
                    <Link key={tag} to={`/schemes?search=${tag}`} className="detail-tag">
                      {translateText(tag, language)}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
             {/* Eligibility */}
            {scheme.eligibility && (
              <div className="sidebar-card animate-fade-in-up delay-100">
                <h3 className="sidebar-card-title">
                  ✅ {language === 'hi' ? 'पात्रता विवरण' : 'Who is it for? (Eligibility)'}
                </h3>
                <p className="sidebar-desc" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-line', marginBottom: '1.25rem' }}>
                  {detail.eligibility}
                </p>
                <div className="divider" style={{ margin: '1rem 0' }} />
                <div className="eligibility-list">
                  {scheme.eligibility.minAge !== undefined && (
                    <div className="elig-item">
                      <span className="elig-icon">👤</span>
                      <div>
                        <div className="elig-label">{language === 'hi' ? TRANSLATIONS.hi.age : TRANSLATIONS.en.age}</div>
                        <div className="elig-value">
                          {scheme.eligibility.minAge} – {scheme.eligibility.maxAge} {language === 'hi' ? TRANSLATIONS.hi.years : TRANSLATIONS.en.years}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="elig-item">
                    <span className="elig-icon">🚻</span>
                    <div>
                      <div className="elig-label">{language === 'hi' ? TRANSLATIONS.hi.gender : TRANSLATIONS.en.gender}</div>
                      <div className="elig-value" style={{ textTransform: 'capitalize' }}>
                        {language === 'hi' ? (TRANSLATIONS.hi[scheme.eligibility.gender.toLowerCase()] || scheme.eligibility.gender) : scheme.eligibility.gender}
                      </div>
                    </div>
                  </div>
                  {scheme.eligibility.incomeLimit && (
                    <div className="elig-item">
                      <span className="elig-icon">💰</span>
                      <div>
                        <div className="elig-label">{language === 'hi' ? TRANSLATIONS.hi.incomelimit : TRANSLATIONS.en.incomeLimit}</div>
                        <div className="elig-value">{formatAmount(scheme.eligibility.incomeLimit)}/{language === 'hi' ? 'वर्ष' : 'year'}</div>
                      </div>
                    </div>
                  )}
                  {scheme.eligibility.caste?.length > 0 && !scheme.eligibility.caste.includes('all') && (
                    <div className="elig-item">
                      <span className="elig-icon">📊</span>
                      <div>
                        <div className="elig-label">{language === 'hi' ? TRANSLATIONS.hi.category : TRANSLATIONS.en.category}</div>
                        <div className="elig-value">
                          {scheme.eligibility.caste.map(c => language === 'hi' ? (TRANSLATIONS.hi[c.toLowerCase()] || c.toUpperCase()) : c.toUpperCase()).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                  {scheme.eligibility.states?.length > 0 && !scheme.eligibility.states.includes('all') && (
                    <div className="elig-item">
                      <span className="elig-icon">🗺</span>
                      <div>
                        <div className="elig-label">{language === 'hi' ? TRANSLATIONS.hi.states : TRANSLATIONS.en.states}</div>
                        <div className="elig-value">{scheme.eligibility.states.join(', ')}</div>
                      </div>
                    </div>
                  )}
                  {scheme.eligibility.occupation?.length > 0 && !scheme.eligibility.occupation.includes('all') && (
                    <div className="elig-item">
                      <span className="elig-icon">💼</span>
                      <div>
                        <div className="elig-label">{language === 'hi' ? TRANSLATIONS.hi.occupation : TRANSLATIONS.en.occupation}</div>
                        <div className="elig-value">
                          {scheme.eligibility.occupation.map(o => language === 'hi' ? (TRANSLATIONS.hi[o.toLowerCase()] || o) : o).join(', ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {scheme.documents?.length > 0 && (
              <div className="sidebar-card animate-fade-in-up delay-200">
                <h3 className="sidebar-card-title">
                  📄 {language === 'hi' ? TRANSLATIONS.hi.requiredDocuments : TRANSLATIONS.en.requiredDocuments}
                </h3>
                <ul className="documents-list">
                  {scheme.documents.map((doc, i) => (
                    <li key={i} className="document-item">
                      <span className="doc-check">✓</span>
                      <span>{translateText(doc, language)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadline / Support Info */}
            <div className="sidebar-card animate-fade-in-up delay-200">
              <h3 className="sidebar-card-title">
                ⏳ {language === 'hi' ? 'महत्वपूर्ण तिथियां और सहायता' : 'Important Dates & Support'}
              </h3>
              <p className="sidebar-desc" style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {detail.deadline}
              </p>
            </div>

            {/* Smart Match CTA */}
            <div className="sidebar-cta-card animate-fade-in-up delay-300">
              <div className="sidebar-cta-icon">🎯</div>
              <h3>{language === 'hi' ? TRANSLATIONS.hi.areYouEligible : TRANSLATIONS.en.areYouEligible}</h3>
              <p>
                {language === 'hi' ? TRANSLATIONS.hi.checkEligibilityDesc : TRANSLATIONS.en.checkEligibilityDesc}
              </p>
              <Link to="/smart-match" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {language === 'hi' ? TRANSLATIONS.hi.checkEligibilityBtn : TRANSLATIONS.en.checkEligibilityBtn}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemeDetail;
