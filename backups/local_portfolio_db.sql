--
-- PostgreSQL database dump
--

\restrict UEhDenJX6hEb0aEIJAqcbbosyNdLouQhCno65fjpkYy3DGXaUOuxOVHenxrpC6c

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Profile; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Profile" (id, "fullName", "displayName", "profileImage", "coverImage", "professionalTitle", tagline, "shortBio", "fullBio", "currentDesignation", "currentOrganization", location, phone, email, website, "careerObjective", philosophy, quote, "resumeUrl", "isVisible", "allowAI", "updatedAt") FROM stdin;
cmtgrc9xs0000oq3k4fdr4t9l	Dr. Sifat Al Sad Rafin	Sifat			Consultant Cardiologist 	Dedicated to advancing cardiovascular care through evidence-based practice, gain knowledge, precision intervention, and compassionate patient-centered treatment.	Dr. Sifat Al Sad Rafin is a Consultant Cardiologist with over 6 years of clinical experience in interventional cardiology and structural heart disease. Currently based at St. Catherine's University Hospital, Dr. Rahman specializes in complex coronary interventions, transcatheter valve therapies, and heart failure management. His research focuses on minimally invasive cardiac procedures and outcomes-based cardiovascular medicine.	Dr. Sifat Al Sad Rafin is a Consultant Cardiologist and Interventional Specialist with a career dedicated to advancing cardiovascular care through clinical excellence, research, and medical education.\n\nAfter completing his medical degree at the University of Edinburgh, Dr. Rahman pursued specialist training in cardiology at the Royal Brompton and Harefield NHS Foundation Trust, where he developed a particular interest in complex coronary interventions and structural heart disease. He subsequently completed a fellowship in Interventional Cardiology at the Cleveland Clinic, gaining expertise in transcatheter aortic valve replacement (TAVR), mitral valve repair, and left atrial appendage occlusion.\n\nCurrently serving as Consultant Cardiologist at St. Catherine's University Hospital, Dr. Rahman leads the Structural Heart Programme and serves as Clinical Lead for the Chest Pain Assessment Unit. His clinical practice encompasses the full spectrum of general and interventional cardiology, with a focus on complex percutaneous coronary interventions, chronic total occlusion (CTO) recanalization, and minimally invasive valve therapies.\n\nDr. Sifat's research interests include outcomes in structural heart interventions, novel antithrombotic strategies, and the application of artificial intelligence in cardiovascular imaging. He has published over 45 peer-reviewed papers in leading cardiology journals and serves on the editorial boards of the European Heart Journal and Catheterization and Cardiovascular Interventions.\n\nBeyond clinical practice, Dr. Rahman is committed to medical education and training. He serves as an Honorary Senior Lecturer at the University of Edinburgh Medical School and supervises interventional cardiology fellows. He regularly speaks at international cardiology conferences and has contributed to several ESC and BSC guidelines on myocardial revascularization and structural heart disease.	Consultant Cardiologist	Dhaka Medical College & Hospital	Dhaka, Mirpur-1, Jhanabad, Mukti Complex	+0081727354578	sifatalsadrafin@gmail.com	https://adrianrahman-cardiology.co.uk	To deliver excellence in cardiovascular care through evidence-based clinical practice, innovative interventional techniques, and compassionate patient-centered medicine, while contributing to the advancement of cardiology through research and education. By Sifat	Sifat Every patient deserves a careful, personalized approach to cardiovascular care. I believe that the best outcomes come from combining rigorous evidence with genuine compassion, clear communication, and a commitment to understanding each patient as an individual.	The heart is not just an organ — it is the center of a patient's life, and our responsibility is to treat it with the care it deserves. ~Sifat	https://rakinirtiza.netlify.app/	t	t	2026-08-31 18:48:23.309
\.


--
-- Data for Name: Achievement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Achievement" (id, title, "awardingOrganization", date, description, image, "certificateUrl", "externalUrl", "isVisible", "isFeatured", "sortOrder", "profileId", "createdAt", "updatedAt") FROM stdin;
cmtgrc9xs000ioq3k32drlgva	British Cardiovascular Intervention Society Trainee Research Prize	British Cardiovascular Intervention Society	2016-11-20 00:00:00	Awarded for the best trainee research presentation at the BCIS Annual Scientific Meeting, for work on chronic total occlusion recanalization techniques.	\N	\N	\N	t	t	0	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000joq3ks38iq77i	Clinical Excellence Award — NHS Lothian	NHS Lothian	2022-03-15 00:00:00	Recognised for outstanding contributions to cardiac catheterisation services and the establishment of the TAVR programme at St. Catherine's University Hospital.	\N	\N	\N	t	t	1	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000koq3kesj3c8ld	ESC Prevention of CVD Programme — Best Abstract Award	European Society of Cardiology	2023-08-28 00:00:00	Received Best Abstract Award at the ESC Preventive Cardiology Congress for research on AI-assisted cardiovascular risk prediction in primary care.	\N	\N	\N	t	t	2	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000loq3kj41md22g	University of Edinburgh — Honorary Senior Lectureship	University of Edinburgh	2020-09-01 00:00:00	Appointed Honorary Senior Lecturer at the University of Edinburgh Medical School in recognition of contributions to medical education and training.	\N	\N	\N	t	f	3	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000moq3kj6qfbmhk	Published Author — Oxford University Press Cardiology Textbook	Oxford University Press	2021-04-01 00:00:00	Contributed chapters on structural heart interventions and chronic total occlusion management to the Oxford Textbook of Interventional Cardiology.	\N	\N	\N	t	f	4	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
\.


--
-- Data for Name: AiConversation; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiConversation" (id, "userId", "startedAt") FROM stdin;
\.


--
-- Data for Name: AiKnowledgeItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiKnowledgeItem" (id, content, "sourceType", "isVisible", "allowAI", "lastUpdated") FROM stdin;
\.


--
-- Data for Name: AiMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiMessage" (id, "conversationId", role, content, "createdAt") FROM stdin;
\.


--
-- Data for Name: AiSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AiSettings" (id, enabled, "assistantName", "assistantAvatar", "welcomeMessage", "systemInstruction", temperature, "maxTokens", "rateLimit", "updatedAt") FROM stdin;
cmtgrca02001noq3kdyeqivze	t	Dr. Rahman's Assistant	\N	Hello! I'm an AI assistant with knowledge of Dr. Adrian Rahman's clinical practice and professional background. How can I help you learn about his work in cardiology?	You are a helpful AI assistant for Dr. Adrian Rahman's cardiology portfolio. Answer questions about Dr. Rahman's clinical practice, publications, and expertise in interventional cardiology, structural heart disease, and cardiovascular medicine. Be professional, knowledgeable, and engaging. If you don't know something specific, you can speak generally about the topics Dr. Rahman works on. Do not provide personal medical advice — direct users to seek consultation with their own healthcare provider.	0.7	1000	100	2026-08-31 04:47:59.138
\.


--
-- Data for Name: Article; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Article" (id, title, slug, excerpt, content, "coverImage", "readingTime", "isDraft", "isPublished", "isFeatured", "publishDate", "seoTitle", "seoDescription", "canonicalUrl", "ogImage", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmtgrc9y3000noq3ka6azh46q	Understanding TAVR: What Patients Need to Know About Transcatheter Aortic Valve Replacement	understanding-tavr-patients	Transcatheter aortic valve replacement has transformed the treatment of aortic stenosis. Here is what patients and families should know about this minimally invasive procedure.	Aortic stenosis is one of the most common valve diseases affecting older adults. When the aortic valve becomes narrowed, the heart must work harder to pump blood to the body. For patients who are at high or intermediate surgical risk, transcatheter aortic valve replacement (TAVR) offers an effective, minimally invasive alternative to traditional open-heart surgery.\n\n## What is TAVR?\n\nTAVR is a procedure that replaces a damaged aortic valve without the need for open-heart surgery. A catheter is inserted through a small incision, usually in the groin, and guided to the heart. A new valve is then placed inside the diseased valve, restoring normal blood flow.\n\n## Who is TAVR Suitable For?\n\nTAVR was initially developed for patients who were too high-risk for conventional surgery. However, evidence from landmark trials including PARTNER 3 and Evolut Low Risk has demonstrated that TAVR is also effective in low-risk patients. Your heart team — including a cardiologist, cardiac surgeon, and imaging specialist — will assess your individual risk profile and recommend the most appropriate treatment.\n\n## Benefits of TAVR\n\n- **Minimally invasive**: Small incision, no sternotomy\n- **Faster recovery**: Most patients go home within 2-3 days\n- **Effective relief**: Significant improvement in symptoms and quality of life\n- **Low complication rates**: Contemporary TAVR programmes report 30-day mortality rates below 2% in appropriately selected patients\n\n## Recovery and Follow-Up\n\nAfter TAVR, patients are monitored in hospital for 1-3 days. Most return to normal activities within 2-4 weeks. Regular follow-up appointments ensure the new valve is functioning well and any necessary medications are optimised.\n\n## The Importance of Heart Team Discussion\n\nEvery patient considering TAVR should be discussed at a multidisciplinary heart team meeting. This ensures that the treatment recommendation accounts for your anatomy, risk profile, and personal preferences.	\N	\N	f	t	t	2024-03-05 00:00:00	Understanding TAVR — A Patient's Guide to Transcatheter Aortic Valve Replacement	Dr. Adrian Rahman explains what patients need to know about TAVR, a minimally invasive treatment for aortic stenosis.	\N	\N	0	2026-08-31 04:47:59.068	2026-08-31 04:47:59.068
cmtgrc9yu000woq3khvttjbih	Heart Health After 50: A Cardiologist's Guide to Prevention	heart-health-after-50	Cardiovascular disease remains the leading cause of death globally. Here are evidence-based steps you can take after 50 to protect your heart.	Heart disease is largely preventable. Yet cardiovascular disease remains the leading cause of death worldwide. After the age of 50, the risk of heart attack, stroke, and heart failure increases significantly — making proactive prevention essential.\n\n## Know Your Numbers\n\nRegular health checks should include:\n- **Blood pressure**: Target less than 130/80 mmHg for most adults\n- **Cholesterol**: LDL cholesterol should be assessed and managed according to your overall cardiovascular risk\n- **Blood sugar**: Diabetes significantly increases cardiovascular risk; early detection is key\n- **Body weight**: Maintaining a healthy BMI reduces strain on the heart\n\n## Stay Active\n\nRegular physical activity is one of the most powerful tools for heart health. Aim for at least 150 minutes of moderate-intensity exercise per week, or 75 minutes of vigorous activity. Walking, cycling, swimming, and strength training all contribute to cardiovascular fitness.\n\n## Eat Well\n\nA heart-healthy diet emphasises:\n- Vegetables, fruits, and whole grains\n- Lean proteins including fish, poultry, and legumes\n- Healthy fats from olive oil, nuts, and avocados\n- Limiting salt, processed foods, and added sugars\n\n## Manage Stress\n\nChronic stress contributes to hypertension and unhealthy lifestyle behaviours. Mindfulness, exercise, adequate sleep, and social connection all play important roles in stress management.\n\n## Don't Ignore Symptoms\n\nChest discomfort, breathlessness, palpitations, dizziness, or unexplained fatigue should always be evaluated promptly. Early intervention saves lives.	\N	\N	f	t	t	2024-01-20 00:00:00	Heart Health After 50 — A Cardiologist's Guide to Prevention	Evidence-based advice from Dr. Adrian Rahman on maintaining heart health after 50.	\N	\N	1	2026-08-31 04:47:59.094	2026-08-31 04:47:59.094
cmtgrc9zc0015oq3k2ogand36	The Role of AI in Modern Cardiac Imaging: Promise and Pragmatism	ai-cardiac-imaging	Artificial intelligence is beginning to transform echocardiography and cardiac MRI. But how close are we to clinical reality?	Artificial intelligence is generating enormous excitement in cardiology. From automated echocardiographic measurements to AI-enhanced coronary CT angiography, the potential applications are vast. But as with any emerging technology, separating genuine clinical utility from hype requires careful evaluation.\n\n## Where AI is Making a Difference\n\nSeveral AI applications have already demonstrated clinical value in cardiac imaging:\n\n**Automated echocardiographic quantification**: Deep learning algorithms can now measure left ventricular ejection fraction, chamber volumes, and strain with accuracy comparable to experienced sonographers. This has particular value in settings where expert imaging support is limited.\n\n**Coronary CT angiography analysis**: AI-powered plaque characterisation and stenosis assessment are improving the diagnostic accuracy of non-invasive coronary imaging, potentially reducing the need for invasive angiography in selected patients.\n\n**Cardiac MRI analysis**: Automated myocardial tissue characterisation using AI can accelerate the analysis of late gadolinium enhancement and T1/T2 mapping, improving workflow efficiency.\n\n## Limitations and Challenges\n\nDespite these advances, several challenges remain:\n\n- **Data quality and bias**: AI models are only as good as their training data. Many published studies use curated datasets that may not represent real-world clinical populations.\n- **Regulatory pathways**: The regulatory landscape for AI in medical imaging is still evolving, and clear standards for validation and approval are needed.\n- **Clinical integration**: Even accurate algorithms must be seamlessly integrated into clinical workflows to deliver value.\n- **Transparency**: Clinicians need to understand how AI algorithms arrive at their conclusions to trust and act on their outputs.\n\n## A Balanced Perspective\n\nAI will not replace cardiologists — but cardiologists who use AI may replace those who do not. The key is to view AI as a tool that augments clinical expertise rather than a substitute for it. Rigorous validation, thoughtful implementation, and ongoing monitoring are essential to realising the genuine benefits of AI in cardiac imaging.	\N	\N	f	t	f	2023-11-10 00:00:00	AI in Cardiac Imaging — Clinical Promise vs. Reality	Dr. Adrian Rahman discusses the current state and future of artificial intelligence in cardiac imaging.	\N	\N	2	2026-08-31 04:47:59.112	2026-08-31 04:47:59.112
\.


--
-- Data for Name: ArticleCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ArticleCategory" (id, name, slug) FROM stdin;
cmtgrc9y6000ooq3k6s3qfmik	Cardiology	cardiology
cmtgrc9yc000poq3k3y9npk9t	Clinical Practice	clinical-practice
cmtgrc9yf000qoq3kyrt5jahg	Medical Research	medical-research
\.


--
-- Data for Name: ArticleTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ArticleTag" (id, name, slug) FROM stdin;
cmtgrc9yi000roq3kwlut5rwn	Cardiology	cardiology
cmtgrc9yl000soq3kpyxy19i7	Interventional	interventional
cmtgrc9yn000toq3krkq0jznn	TAVR	tavr
cmtgrc9yp000uoq3kcdfatx58	Prevention	prevention
cmtgrc9ys000voq3kosgnlmkp	Cardiac Imaging	cardiac-imaging
\.


--
-- Data for Name: BrandSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BrandSettings" (id, "siteName", logo, favicon, "primaryColor", "secondaryColor", "accentColor", "textColor", "backgroundColor", "surfaceColor", "borderColor", "borderRadiusButton", "borderRadiusCard", "containerWidth", "baseFont", "headingFont", "headingWeight", "sectionSpacing", "updatedAt", "baseFontSize", "footerContactTitle", "footerDescription", "footerNavTitle", "headingScale", "heroBadgeText", "heroCvCtaLabel", "heroPrimaryCtaDest", "heroPrimaryCtaLabel", "heroSecondaryCtaDest", "heroSecondaryCtaLabel", "heroShowBadge", "heroShowCvCta", "heroShowInterests", "heroShowLocation", "heroShowQualifications", "heroShowWorkplace", "navFontSize", "typographyPreset", "heroBackground", "heroMobileLayout", "heroMobilePortraitHeight", "heroOverlayStyle", "portraitFit", "portraitFocalX", "portraitFocalY", "portraitMaxHeight", "portraitScale", "portraitX", "portraitY", "profileImage") FROM stdin;
cmtgrc9zw001joq3kxvf2sjzi	Dr. Sifat Al Saad Rafin	\N	\N	#0f766e	#f0fdfa	#14b8a6	#0f172a	#ffffff	#f8fafc	#ccfbf1	0.5rem	0.75rem	1280px	Inter	Inter	700	4rem	2026-09-02 02:46:28.711	16px	Connect		Navigation	1.25	Currently Practicing	View CV	/about	Profile	/contact	Connect	t	f	f	t	t	t	14px	balanced	grid	portrait-first	balanced	glass	contain	50	50	500px	1	0	0	\N
\.


--
-- Data for Name: Certification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Certification" (id, title, institution, "issuingOrganization", credential, "issueDate", "expiryDate", description, "credentialUrl", "certificateImage", "isVisible", "isFeatured", "sortOrder", "profileId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContactMessage" (id, name, email, phone, subject, message, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: CvDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CvDocument" (id, title, "fileUrl", "versionDate", "isVisible", "isCurrent", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Education; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Education" (id, degree, institution, department, field, "startDate", "endDate", result, description, "institutionUrl", "institutionLogo", "certificateUrl", "isVisible", "isFeatured", "sortOrder", "profileId", "createdAt", "updatedAt") FROM stdin;
cmtgrc9xs0001oq3kpr54hkyq	MBChB (Bachelor of Medicine & Surgery)	University of Edinburgh	Edinburgh Medical School	Medicine	2004-09-01 00:00:00	2009-06-30 00:00:00	Honours	Graduated with Honours in Medicine and Surgery. Awarded the Harveian Society Prize for best performance in Clinical Medicine.	https://www.ed.ac.uk/medicine	\N	\N	t	t	0	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs0002oq3kppwtwa21	MRCP (UK) — Member of the Royal College of Physicians	Royal College of Physicians of Edinburgh	Medicine	Internal Medicine	2010-01-01 00:00:00	2012-06-30 00:00:00	Passed	Postgraduate medical qualification demonstrating breadth of knowledge in internal medicine.	https://www.rcpe.ac.uk	\N	\N	t	t	1	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs0003oq3kwlonpsfd	MD (Doctor of Medicine)	University of Edinburgh	Centre for Cardiovascular Science	Interventional Cardiology	2014-01-01 00:00:00	2017-12-15 00:00:00	Awarded	Doctoral thesis: 'Novel Approaches to Chronic Total Occlusion Recanalization — Clinical Outcomes and Technical Innovations.' Supervised by Prof. David Smith.	https://www.ed.ac.uk/medicine	\N	\N	t	t	2	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs0004oq3kgia8irpg	FESC — Fellow of the European Society of Cardiology	European Society of Cardiology	Interventional Cardiology	Cardiology	2020-01-01 00:00:00	\N	Fellowship	Elected Fellow in recognition of contributions to interventional cardiology and structural heart disease.	https://www.escardio.org	\N	\N	t	f	3	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
\.


--
-- Data for Name: Experience; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Experience" (id, "jobTitle", organization, location, "startDate", "endDate", "isCurrent", description, responsibilities, achievements, "organizationUrl", logo, "isVisible", "isFeatured", "sortOrder", "profileId", "createdAt", "updatedAt") FROM stdin;
cmtgrc9xs0005oq3k6d8ysqwf	Consultant Cardiologist — Interventional & Structural Heart	St. Catherine's University Hospital	Edinburgh, United Kingdom	2019-04-01 00:00:00	\N	t	Leading the Structural Heart Programme and serving as Clinical Lead for the Chest Pain Assessment Unit. Performing complex coronary interventions, TAVR, and structural heart procedures.	Directing the structural heart intervention programme, supervising interventional fellows, leading clinical audit and quality improvement initiatives, participating in national guideline development.	Established the hospital's first TAVR programme, reducing 30-day mortality for high-risk aortic stenosis patients. Published 15+ papers on interventional cardiology outcomes during tenure.	https://www.stcatherinehosp.nhs.uk	\N	t	t	0	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs0006oq3khcoujl5l	Fellow in Interventional Cardiology	Cleveland Clinic — Heart, Vascular & Thoracic Institute	Cleveland, Ohio, USA	2017-07-01 00:00:00	2019-03-31 00:00:00	f	Advanced fellowship in complex coronary interventions, transcatheter valve therapies, and structural heart disease under the mentorship of Dr. Elias Baum and Dr. Amar Krishnaswamy.	Performing complex PCI including chronic total occlusions, rotational atherectomy, and left main interventions. Participating in TAVR and MitraClip procedures. Contributing to multiple clinical trials.	Completed 800+ interventional procedures during fellowship. Co-authored 8 peer-reviewed publications. Presented research at TCT, ACC, and EuroPCR.	https://my.clevelandclinic.org	\N	t	t	1	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs0007oq3kjixm8956	Specialist Registrar in Cardiology	Royal Brompton & Harefield NHS Foundation Trust	London, United Kingdom	2012-08-01 00:00:00	2017-06-30 00:00:00	f	Higher specialist training in cardiology encompassing general cardiology, interventional cardiology, cardiac imaging, and heart failure.	Rotating through general cardiology, cardiac catheterisation, echocardiography, cardiac MRI, and heart failure services. Performing diagnostic coronary angiography and PCI.	Obtained CCT in Cardiology and Interventional Cardiology. Completed BSC certification in echocardiography. Won the British Cardiovascular Intervention Society Trainee Prize 2016.	https://www.rbht.nhs.uk	\N	t	f	2	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs0008oq3kxnf9iiae	Foundation Doctor / Senior House Officer	NHS Lothian — Royal Infirmary of Edinburgh	Edinburgh, United Kingdom	2009-08-01 00:00:00	2012-07-31 00:00:00	f	Foundation and core medical training across acute medicine, surgery, and specialty rotations.	Rotating through general medicine, general surgery, emergency medicine, and geriatric medicine. Developing core clinical skills and medical knowledge.	Passed MRCP (UK) Parts 1, 2, and PACES within 18 months. Selected for competitive cardiology specialty training.	https://www.nhslothian.scot.nhs.uk	\N	t	f	3	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
\.


--
-- Data for Name: Faq; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Faq" (id, question, answer, category, "isVisible", "allowAI", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmtgrc9zs001eoq3kskq4scyq	What should I do if I experience chest pain?	Chest pain should always be taken seriously. If you experience new, severe, or persistent chest pain — especially if accompanied by breathlessness, sweating, nausea, or pain radiating to the arm or jaw — call emergency services immediately. For non-emergency chest pain, I would recommend discussing it with your GP, who may refer you for cardiac assessment including an ECG, blood tests, and potentially further investigation.	Clinical	t	t	0	2026-08-31 04:47:59.129	2026-08-31 04:47:59.129
cmtgrc9zt001foq3ktd0eb7tg	What is the difference between a heart attack and cardiac arrest?	A heart attack occurs when blood flow to part of the heart muscle is blocked, usually by a blood clot in a coronary artery. The heart muscle is damaged but the heart continues to beat. A cardiac arrest is different — it occurs when the heart suddenly stops beating effectively, usually due to a dangerous heart rhythm. Both are medical emergencies, but a cardiac arrest is immediately life-threatening and requires CPR and defibrillation.	Clinical	t	t	1	2026-08-31 04:47:59.13	2026-08-31 04:47:59.13
cmtgrc9zu001goq3krlntwhrj	How often should I have my heart checked?	For healthy adults, regular health checks with your GP including blood pressure and cholesterol assessment are recommended at least every 5 years, or more frequently if you have risk factors such as diabetes, hypertension, family history of heart disease, or smoking. If you have existing heart conditions, your cardiologist will recommend an appropriate follow-up schedule based on your individual needs.	Preventive	t	t	2	2026-08-31 04:47:59.13	2026-08-31 04:47:59.13
cmtgrc9zv001hoq3kc2xsrw5d	What lifestyle changes can most improve heart health?	The most impactful lifestyle changes for heart health are: regular physical activity (at least 150 minutes of moderate exercise per week), a heart-healthy diet rich in vegetables, fruits, whole grains and healthy fats, maintaining a healthy weight, not smoking, moderating alcohol intake, managing stress, and ensuring good quality sleep. These changes, combined with appropriate medical management of risk factors, significantly reduce cardiovascular risk.	Preventive	t	t	3	2026-08-31 04:47:59.131	2026-08-31 04:47:59.131
cmtgrc9zv001ioq3kamqho25d	Is TAVR suitable for all patients with aortic stenosis?	TAVR is a highly effective treatment for aortic stenosis, but it is not suitable for everyone. Patient selection requires careful assessment by a multidisciplinary heart team, including consideration of your anatomy, surgical risk profile, age, and personal preferences. In general, TAVR is well-suited for patients at high or intermediate surgical risk, and increasingly for low-risk patients as well. Your heart team can advise on the most appropriate treatment for your individual situation.	Clinical	t	t	4	2026-08-31 04:47:59.132	2026-08-31 04:47:59.132
\.


--
-- Data for Name: GalleryCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GalleryCategory" (id, name, slug) FROM stdin;
\.


--
-- Data for Name: MediaAsset; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MediaAsset" (id, "publicId", "secureUrl", width, height, format, "resourceType", "altText", folder, "createdAt", "updatedAt", "originalFilename", "displayName", purpose) FROM stdin;
cmthkhqel0009zwof94ajbggl	portfolio/fqcdh04fetdfmprra220	https://res.cloudinary.com/rsqokkve/image/upload/v1788200641/portfolio/fqcdh04fetdfmprra220.png	1	1	png	image	V6 Test PNG	portfolio	2026-08-31 18:24:02.542	2026-08-31 18:24:02.542	\N	\N	GENERAL
cmthkrnt20000isf49bkq7u7u	portfolio/es4xcrvzdawbjfxbxjys	https://res.cloudinary.com/rsqokkve/image/upload/v1788201104/portfolio/es4xcrvzdawbjfxbxjys.jpg	1	1	jpg	image	V6 Test JPG	portfolio	2026-08-31 18:31:45.735	2026-08-31 18:31:45.735	\N	\N	GENERAL
cmthkrqa30001isf4y1engr7v	portfolio/kgptote3hx60muxnbbiu	https://res.cloudinary.com/rsqokkve/image/upload/v1788201108/portfolio/kgptote3hx60muxnbbiu.png	1	1	png	image	V6 Test PNG	portfolio	2026-08-31 18:31:48.939	2026-08-31 18:31:48.939	\N	\N	GENERAL
cmthkwfvo0002isf42pwcmka2	portfolio/d9jddzil7r72jinddlcz	https://res.cloudinary.com/rsqokkve/image/upload/v1788201327/portfolio/d9jddzil7r72jinddlcz.jpg	1	1	jpg	image	V6 Test JPG	portfolio	2026-08-31 18:35:28.74	2026-08-31 18:35:28.74	\N	\N	GENERAL
cmthkwmit0003isf47clpz3aa	portfolio/hcacgdmhjagofknlgno4	https://res.cloudinary.com/rsqokkve/image/upload/v1788201336/portfolio/hcacgdmhjagofknlgno4.png	1	1	png	image	V6 Test PNG	portfolio	2026-08-31 18:35:37.349	2026-08-31 18:35:37.349	\N	\N	GENERAL
cmthl1ldn0004isf473j9vmfq	portfolio/yvakbag3m0w6fzhw5oio	https://res.cloudinary.com/rsqokkve/image/upload/v1788201567/portfolio/yvakbag3m0w6fzhw5oio.jpg	1	1	jpg	image	V6 Test JPG	portfolio	2026-08-31 18:39:29.147	2026-08-31 18:39:29.147	\N	\N	GENERAL
cmthl1s3t0005isf4vxw5gxyg	portfolio/kynzlx63lfwof8rwtse6	https://res.cloudinary.com/rsqokkve/image/upload/v1788201577/portfolio/kynzlx63lfwof8rwtse6.png	1	1	png	image	V6 Test PNG	portfolio	2026-08-31 18:39:37.865	2026-08-31 18:39:37.865	\N	\N	GENERAL
cmthl70z40006isf407t3khyj	portfolio/mo130pzuduxvuyf0ag6u	https://res.cloudinary.com/rsqokkve/image/upload/v1788201821/portfolio/mo130pzuduxvuyf0ag6u.jpg	1	1	jpg	image	V6 Test JPG	portfolio	2026-08-31 18:43:42.641	2026-08-31 18:43:42.641	\N	\N	GENERAL
cmthl77yz0007isf4w74dfbip	portfolio/ivoqhg8izr4qrebf8vvv	https://res.cloudinary.com/rsqokkve/image/upload/v1788201830/portfolio/ivoqhg8izr4qrebf8vvv.png	1	1	png	image	V6 Test PNG	portfolio	2026-08-31 18:43:51.708	2026-08-31 18:43:51.708	\N	\N	GENERAL
cmthl9qgy0008isf4mkfhvgi5	portfolio/todiezjhubomk1ewfcry	https://res.cloudinary.com/rsqokkve/image/upload/v1788201947/portfolio/todiezjhubomk1ewfcry.jpg	1	1	jpg	image	V6 Test JPG	portfolio	2026-08-31 18:45:48.995	2026-08-31 18:45:48.995	\N	\N	GENERAL
cmthl9xn50009isf40i00x1pq	portfolio/ydyjylhx7fkkbilemmga	https://res.cloudinary.com/rsqokkve/image/upload/v1788201957/portfolio/ydyjylhx7fkkbilemmga.png	1	1	png	image	V6 Test PNG	portfolio	2026-08-31 18:45:58.289	2026-08-31 18:45:58.289	\N	\N	GENERAL
cmtjhqh740000rmxramrfi8ll	portfolio/v7-filename-test-1abn76	https://res.cloudinary.com/rsqokkve/image/upload/v1788316943/portfolio/v7-filename-test-1abn76.jpg	1	1	jpg	image		portfolio	2026-09-02 02:42:24.016	2026-09-02 02:42:24.016	v7-filename-test.jpg	v7-filename-test	GENERAL
cmtjhqpp30001rmxr8ehsl1uh	portfolio/v7-test-live-cevsuw	https://res.cloudinary.com/rsqokkve/image/upload/v1788316954/portfolio/v7-test-live-cevsuw.jpg	1	1	jpg	image	V7 Live Update Test	portfolio	2026-09-02 02:42:35.032	2026-09-02 02:42:35.032	v7-test-live.jpg	v7-test-live	GENERAL
cmtjht50w0002rmxrt0rixlzk	portfolio/v7-filename-test-1d6yh5	https://res.cloudinary.com/rsqokkve/image/upload/v1788317067/portfolio/v7-filename-test-1d6yh5.jpg	1	1	jpg	image		portfolio	2026-09-02 02:44:28.209	2026-09-02 02:44:28.209	v7-filename-test.jpg	v7-filename-test	GENERAL
cmtjhtbes0003rmxrmaplowue	portfolio/v7-test-live-6it2jm	https://res.cloudinary.com/rsqokkve/image/upload/v1788317076/portfolio/v7-test-live-6it2jm.jpg	1	1	jpg	image	V7 Live Update Test	portfolio	2026-09-02 02:44:36.484	2026-09-02 02:44:36.484	v7-test-live.jpg	v7-test-live	GENERAL
cmtjhuugh0004rmxrnste8iv0	portfolio/v7-filename-test-zjxhld	https://res.cloudinary.com/rsqokkve/image/upload/v1788317147/portfolio/v7-filename-test-zjxhld.jpg	1	1	jpg	image		portfolio	2026-09-02 02:45:47.826	2026-09-02 02:45:47.826	v7-filename-test.jpg	v7-filename-test	GENERAL
cmtjhuwfd0005rmxr5sml7klc	portfolio/v6-test-mkhadb	https://res.cloudinary.com/rsqokkve/image/upload/v1788317149/portfolio/v6-test-mkhadb.jpg	1	1	jpg	image	V6 Test JPG	portfolio	2026-09-02 02:45:50.377	2026-09-02 02:45:50.377	v6-test.jpg	v6-test	GENERAL
\.


--
-- Data for Name: GalleryItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GalleryItem" (id, "mediaAssetId", caption, category, "isVisible", "isFeatured", "captureDate", location, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: HeroOverlay; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HeroOverlay" (id, key, label, "valueType", "customValue", "valueSource", "isVisible", "desktopVisible", "mobileVisible", "desktopX", "desktopY", "mobileX", "mobileY", width, alignment, opacity, "styleVariant", "sortOrder", "updatedAt") FROM stdin;
cmthgw4550000zwofbcub76ei	overlay-1788194595011	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	3	2026-09-02 02:46:28.962
cmthgxibg0001zwofn4p8ronm	overlay-1788194660057	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	4	2026-09-02 02:46:29.035
cmthh30qk0002zwofyiz4f235	overlay-1788194917196	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	5	2026-09-02 02:46:29.097
cmthh3c1u0003zwof18vuur2c	overlay-1788194931845	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	6	2026-09-02 02:46:29.176
cmthhggwx0004zwofq0lhdd8t	overlay-1788195544690	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	7	2026-09-02 02:46:29.271
cmthhgrqk0005zwof29dd9cy2	overlay-1788195558722	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	8	2026-09-02 02:46:29.349
cmthldarl000aisf4c1jvuun7	overlay-1788202115175	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	9	2026-09-02 02:46:29.426
cmthldl69000bisf4i62cebwp	overlay-1788202128708	New Overlay	MANUAL	Value	\N	t	t	t	50	50	50	50	160px	left	1	glass	10	2026-09-02 02:46:29.493
cmtgylo5b000010l8bttve29y	currentRole	Current Role	AUTO	\N	currentDesignation	t	t	t	26.1	15.2	5	85	160px	left	1	glass	0	2026-09-02 02:46:28.729
cmtgylo5k000110l8q0ecev69	credentials	Credentials	AUTO	\N	qualificationCount	t	t	t	78	35	75	10	160px	left	1	glass	1	2026-09-02 02:46:28.816
cmtgylo5m000210l87y0l39ct	location	Location	AUTO	\N	location	f	t	f	82	65	5	92	160px	left	1	glass	2	2026-09-02 02:46:28.893
\.


--
-- Data for Name: HighlightMetric; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HighlightMetric" (id, key, "isVisible", label, icon, "sortOrder", "valueMode", "manualValue", "updatedAt") FROM stdin;
cmtgtmfyy0000lt3hgykmsr2u	qualifications	t	Credentials	Award	0	AUTO	\N	2026-08-31 05:51:52.666
cmtgtmfz30001lt3hcj0r8mdv	experience	t	Experience	Briefcase	1	AUTO	\N	2026-08-31 05:51:52.672
cmtgtmfz50002lt3hgjq25ftg	publications	t	Publications	BookOpen	2	AUTO	\N	2026-08-31 05:51:52.673
cmtgtmfz60003lt3hjtshayj2	achievements	t	Awards	Trophy	3	AUTO	\N	2026-08-31 05:51:52.675
cmtgtmfz70004lt3hfyuc48w7	education	t	Education	GraduationCap	4	AUTO	\N	2026-08-31 05:51:52.676
\.


--
-- Data for Name: HomeSection; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."HomeSection" (id, "sectionId", label, "isVisible", "sortOrder", "layoutVariant", "updatedAt", eyebrow, heading, "sectionNumber", "showSectionNumber", "supportingText") FROM stdin;
cmtgrca06001qoq3ktqug96yb	EXPERIENCE_HIGHLIGHTS	Experience Highlights	t	1	default	2026-08-31 12:17:57.489	Career	Professional Journey	02	t	\N
cmtgrca03001ooq3krxr2dzev	HERO	Hero	t	0	default	2026-08-31 12:18:01.111			\N	f	\N
cmtgrca07001soq3k099lhgr2	EDUCATION_HIGHLIGHTS	Education Highlights	t	4	default	2026-08-31 05:51:52.684	Academic	Education	03	t	\N
cmtgrca06001roq3khqko80zc	QUALIFICATIONS	Qualifications	t	3	default	2026-08-31 05:51:52.685	Credentials	Qualifications	04	t	\N
cmtgrca08001toq3kyhkr7sov	PUBLICATIONS	Publications	t	5	default	2026-08-31 05:51:52.686	Research	Publications	05	t	\N
cmtgrca08001uoq3k5k7ccajb	ACHIEVEMENTS	Achievements	t	6	default	2026-08-31 05:51:52.686	Recognition	Achievements	06	t	\N
cmtgrca09001woq3k7v7m4kcg	ARTICLES	Articles	t	8	default	2026-08-31 05:51:52.687	Journal	Latest Articles	07	t	\N
cmtgrca09001voq3kf044v2z7	GALLERY	Gallery	t	7	default	2026-08-31 05:51:52.688	Moments	Gallery	08	t	\N
cmtgrca0a001xoq3k82r1xj1y	AI_CTA	AI Assistant CTA	t	9	default	2026-08-31 05:51:52.689	Digital Assistant	AI Insight	09	t	\N
cmtgrca0b001yoq3kj6ztoojd	CONTACT_CTA	Contact CTA	t	10	default	2026-08-31 05:51:52.689	Connect	Get in Touch	10	t	\N
cmtgrca05001poq3ksanyiui7	INTRO	Introduction	t	2	default	2026-08-31 11:57:52.776	Profile	More Than Credentials	01	t	\N
\.


--
-- Data for Name: NavigationItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."NavigationItem" (id, label, destination, "isVisible", "isExternal", "sortOrder", "updatedAt", "desktopVisible", icon, "mobileVisible") FROM stdin;
cmtgrca0b001zoq3kkqn0xb7n	Home	/	t	f	0	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0c0020oq3kvlm67o0o	About	/about	t	f	1	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0d0021oq3kobvz2w6c	Experience	/experience	t	f	2	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0e0022oq3kbglaa4xk	Education	/education	t	f	3	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0e0023oq3kvuc975cv	Qualifications	/qualifications	t	f	4	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0f0024oq3kddgfr9at	Publications	/publications	t	f	5	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0g0025oq3kt3qfxtrc	Articles	/articles	t	f	6	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0h0026oq3kjkn6h46c	Gallery	/gallery	t	f	7	2026-08-31 05:51:52.677	t	\N	t
cmtgrca0h0027oq3k520bchxc	Contact	/contact	t	f	8	2026-08-31 05:51:52.677	t	\N	t
\.


--
-- Data for Name: ProfessionalInterest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProfessionalInterest" (id, title, icon, "shortDescription", "fullDescription", image, "isVisible", "isFeatured", "sortOrder", "profileId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Publication; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Publication" (id, title, slug, authors, journal, conference, publisher, "publicationDate", abstract, doi, citation, "externalUrl", "pdfUrl", "coverImage", "isVisible", "isFeatured", "isPublished", "sortOrder", "profileId", "createdAt", "updatedAt") FROM stdin;
cmtgrc9xs000doq3ki9b9ofgm	Outcomes of Transcatheter Aortic Valve Replacement in Patients with Bicuspid Aortic Valve: A Multicenter Registry Analysis	tavr-bicuspid-outcomes	A. Rahman, S. Patel, M. Chen, L. Andersen	European Heart Journal	\N	\N	2024-02-10 00:00:00	This multicenter registry study evaluates 30-day and 1-year outcomes of TAVR in patients with bicuspid aortic valve anatomy across 12 high-volume centres. Results demonstrate favourable procedural success and low rates of significant paravalvular leak with contemporary valve designs.	10.1093/eurheartj/ehae123	Rahman, A., Patel, S., Chen, M., & Andersen, L. (2024). Outcomes of transcatheter aortic valve replacement in patients with bicuspid aortic valve. European Heart Journal, 45(8), 612-624.	\N	\N	\N	t	t	t	0	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000eoq3kjsuv425u	Chronic Total Occlusion Recanalization: Technical Innovations and Clinical Outcomes from a 10-Year Single-Centre Experience	cto-recanalization-outcomes	A. Rahman, K. Yamamoto, R. Hughes	Catheterization and Cardiovascular Interventions	\N	\N	2023-08-22 00:00:00	We report procedural success rates, complications, and long-term clinical outcomes of CTO PCI performed at a high-volume UK centre over a 10-year period. The adoption of contemporary techniques including retrograde approach and antegrade dissection re-entry improved procedural success from 72% to 91%.	10.1002/ccd.30892	Rahman, A., Yamamoto, K., & Hughes, R. (2023). Chronic total occlusion recanalization: Technical innovations and clinical outcomes. Catheterization and Cardiovascular Interventions, 102(3), 456-465.	\N	\N	\N	t	t	t	1	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000foq3kums58lvz	Dual Antiplatelet Therapy Duration After Complex Percutaneous Coronary Intervention: A Systematic Review and Meta-Analysis	dapt-complex-pci	A. Rahman, J. Park, T. Williams	Journal of the American College of Cardiology	\N	\N	2023-03-14 00:00:00	This meta-analysis of 18 randomized controlled trials evaluates the optimal duration of dual antiplatelet therapy following complex PCI, including left main, bifurcation, and multivessel interventions. Findings support individualized DAPT duration based on bleeding and ischaemic risk stratification.	10.1016/j.jacc.2023.01.045	Rahman, A., Park, J., & Williams, T. (2023). Dual antiplatelet therapy duration after complex PCI. Journal of the American College of Cardiology, 81(11), 1023-1036.	\N	\N	\N	t	t	t	2	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000goq3kskpwmcry	Artificial Intelligence in Echocardiography: Current Applications and Future Directions	ai-echocardiography-review	A. Rahman, F. Zhang, N. Brown	Heart	\N	\N	2022-11-05 00:00:00	This review examines the current state of AI applications in echocardiography, including automated chamber quantification, strain analysis, and valvular heart disease assessment. We discuss the potential for AI to improve diagnostic accuracy and workflow efficiency in clinical practice.	10.1136/heartjnl-2022-321789	Rahman, A., Zhang, F., & Brown, N. (2022). Artificial intelligence in echocardiography. Heart, 108(22), 1765-1773.	\N	\N	\N	t	f	t	3	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000hoq3kjtz9dtl6	Left Atrial Appendage Occlusion in Patients with Atrial Fibrillation and Contraindication to Anticoagulation: A Practical Guide	laaoc-practical-guide	A. Rahman, D. Smith	EuroIntervention	\N	\N	2022-06-18 00:00:00	A practical guide covering patient selection, procedural technique, imaging guidance, and post-procedural management for left atrial appendage occlusion using the Watchman device. Includes step-by-step procedural framework based on 200 consecutive cases.	10.4244/EIJ-D-22-00345	Rahman, A., & Smith, D. (2022). Left atrial appendage occlusion: A practical guide. EuroIntervention, 18(4), e312-e321.	\N	\N	\N	t	f	t	4	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
\.


--
-- Data for Name: Qualification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Qualification" (id, title, institution, "issuingOrganization", credential, "issueDate", "expiryDate", description, "credentialUrl", "certificateImage", "isVisible", "isFeatured", "sortOrder", "profileId", "createdAt", "updatedAt") FROM stdin;
cmtgrc9xs0009oq3kk1u0yxal	CCT — Cardiology & Interventional Cardiology	General Medical Council (UK)	General Medical Council	GMC No. 7432198	2017-07-15 00:00:00	\N	Certificate of Completion of Training in Cardiology and Interventional Cardiology, confirming eligibility for consultant-level practice.	\N	\N	t	t	0	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000aoq3knk2dnin2	FESC — Fellow of the European Society of Cardiology	European Society of Cardiology	European Society of Cardiology	FESC-2020-4821	2020-01-15 00:00:00	\N	Elected Fellow in recognition of outstanding contributions to interventional cardiology and structural heart disease.	\N	\N	t	t	1	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000boq3kmxc43wsn	BCS Certification in Echocardiography	British Society of Echocardiography	British Society of Echocardiography	BSE-2015-1127	2015-03-20 00:00:00	\N	Certification in transthoracic and transoesophageal echocardiography, including structural heart assessment.	\N	\N	t	f	2	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
cmtgrc9xs000coq3kkthhh7b0	Advanced Cardiac Life Support (ACLS) Provider	Resuscitation Council UK	Resuscitation Council UK	ACLS-2024-00891	2024-06-10 00:00:00	2026-06-10 00:00:00	Certification in advanced cardiac resuscitation algorithms and emergency cardiac care.	\N	\N	t	f	3	cmtgrc9xs0000oq3k4fdr4t9l	2026-08-31 04:47:59.056	2026-08-31 04:47:59.056
\.


--
-- Data for Name: SeoSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SeoSettings" (id, "templateTitle", "templateDescription", "ogImage", "twitterHandle", "updatedAt") FROM stdin;
cmtgrca01001moq3k8lw5xpmy	{displayName} | {professionalTitle}	Professional portfolio of {displayName}, {professionalTitle}.			2026-08-31 04:47:59.137
\.


--
-- Data for Name: SiteSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SiteSettings" (id, "siteUrl", "siteTitle", "siteDescription", "defaultLanguage", timezone, "contactVisibility", "analyticsId", "aiEnabled", "galleryEnabled", "galleryLabel", "blogEnabled", "maintenanceMode", "footerText", "copyrightText", "updatedAt", "showLocalInfo") FROM stdin;
cmtgrc9zz001loq3k6vk547pw	https://adrianrahman-cardiology.co.uk	Dr. Adrian Rahman — Consultant Cardiologist	Official portfolio of Dr. Adrian Rahman, Consultant Cardiologist and Interventional Specialist at St. Catherine's University Hospital, Edinburgh.	en	Asia/Dhaka	t	\N	t	t	Gallery	t	f	Dedicated to advancing cardiovascular care through evidence-based practice and compassionate patient-centered medicine.	© 2024 Dr. Adrian Rahman. All rights reserved.	2026-08-31 05:51:52.66	f
\.


--
-- Data for Name: SocialLink; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SocialLink" (id, platform, label, url, icon, "isVisible", "sortOrder", "updatedAt") FROM stdin;
cmtgrca0i0028oq3klg37vgqv	LinkedIn	LinkedIn	https://linkedin.com/in/adrianrahman	\N	t	0	2026-08-31 04:47:59.154
cmtgrca0j0029oq3kgg2mvu7r	ResearchGate	ResearchGate	https://researchgate.net/profile/adrian-rahman	\N	t	1	2026-08-31 04:47:59.155
cmtgrca0j002aoq3kazzak48r	ORCID	ORCID	https://orcid.org/0000-0002-1234-5678	\N	t	2	2026-08-31 04:47:59.156
\.


--
-- Data for Name: ThemeSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ThemeSettings" (id, "currentTheme", "presetName", "isManualOverride", "updatedAt") FROM stdin;
cmtgrc9zx001koq3kh4g8ltz6	SYSTEM	Clean Professional	f	2026-08-31 06:50:15.478
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, "passwordHash", role, "createdAt", "updatedAt") FROM stdin;
cmtg41l0o00007826lulmnj5d	admin@example.com	$2b$12$7Y5avugIVULuowxuD3pFW.1ke3a9jy4uwBiCwCoo1UUMMkGKTcObi	OWNER	2026-08-30 17:55:49.031	2026-08-30 17:55:49.031
\.


--
-- Data for Name: _ArticleToArticleCategory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ArticleToArticleCategory" ("A", "B") FROM stdin;
cmtgrc9y3000noq3ka6azh46q	cmtgrc9y6000ooq3k6s3qfmik
cmtgrc9y3000noq3ka6azh46q	cmtgrc9yc000poq3k3y9npk9t
cmtgrc9y3000noq3ka6azh46q	cmtgrc9yf000qoq3kyrt5jahg
cmtgrc9yu000woq3khvttjbih	cmtgrc9y6000ooq3k6s3qfmik
cmtgrc9yu000woq3khvttjbih	cmtgrc9yc000poq3k3y9npk9t
cmtgrc9yu000woq3khvttjbih	cmtgrc9yf000qoq3kyrt5jahg
cmtgrc9zc0015oq3k2ogand36	cmtgrc9y6000ooq3k6s3qfmik
cmtgrc9zc0015oq3k2ogand36	cmtgrc9yc000poq3k3y9npk9t
cmtgrc9zc0015oq3k2ogand36	cmtgrc9yf000qoq3kyrt5jahg
\.


--
-- Data for Name: _ArticleToArticleTag; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."_ArticleToArticleTag" ("A", "B") FROM stdin;
cmtgrc9y3000noq3ka6azh46q	cmtgrc9yi000roq3kwlut5rwn
cmtgrc9y3000noq3ka6azh46q	cmtgrc9yl000soq3kpyxy19i7
cmtgrc9y3000noq3ka6azh46q	cmtgrc9yn000toq3krkq0jznn
cmtgrc9y3000noq3ka6azh46q	cmtgrc9yp000uoq3kcdfatx58
cmtgrc9y3000noq3ka6azh46q	cmtgrc9ys000voq3kosgnlmkp
cmtgrc9yu000woq3khvttjbih	cmtgrc9yi000roq3kwlut5rwn
cmtgrc9yu000woq3khvttjbih	cmtgrc9yl000soq3kpyxy19i7
cmtgrc9yu000woq3khvttjbih	cmtgrc9yn000toq3krkq0jznn
cmtgrc9yu000woq3khvttjbih	cmtgrc9yp000uoq3kcdfatx58
cmtgrc9yu000woq3khvttjbih	cmtgrc9ys000voq3kosgnlmkp
cmtgrc9zc0015oq3k2ogand36	cmtgrc9yi000roq3kwlut5rwn
cmtgrc9zc0015oq3k2ogand36	cmtgrc9yl000soq3kpyxy19i7
cmtgrc9zc0015oq3k2ogand36	cmtgrc9yn000toq3krkq0jznn
cmtgrc9zc0015oq3k2ogand36	cmtgrc9yp000uoq3kcdfatx58
cmtgrc9zc0015oq3k2ogand36	cmtgrc9ys000voq3kosgnlmkp
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0406209b-bfe7-437f-9dd4-131509b1d197	838eb6c0186d6fd6ce4e21c3ce45f7dc5d9e0c7533fccfb37f7335d37a8601fc	2026-08-30 23:55:33.735626+06	20240101000000_init	\N	\N	2026-08-30 23:55:33.600816+06	1
f102d1ae-a0b2-496a-9a9f-076191cb9195	9feb65129ac1022151d87dd93a395021141f6eb8bf8d032d481c9899fb3820b3	2026-08-31 14:58:04.12499+06	20260831000000_v5_hero_overlay		\N	2026-08-31 14:58:04.12499+06	0
212dd92d-86b9-4e6c-a000-1dcd461f7c17	3848fcfc58975d7735ba28bb4f9a1784c59cb5b2471886cb9ea825a3a9faa015	2026-09-02 08:06:24.085492+06	20260901000000_v7_media_asset_fields	\N	\N	2026-09-02 08:06:24.049329+06	1
\.


--
-- PostgreSQL database dump complete
--

\unrestrict UEhDenJX6hEb0aEIJAqcbbosyNdLouQhCno65fjpkYy3DGXaUOuxOVHenxrpC6c

