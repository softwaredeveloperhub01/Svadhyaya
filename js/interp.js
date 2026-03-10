'use strict';
const Interp = {

  // ── Planet-in-Sign ────────────────────────────────────────────────────────
  planetSign: {
    Sun: { Aries:'Your identity is energized and action-oriented. Pioneer spirit, natural leadership, channel impatience into decisive action.', Taurus:'Identity grounded in stability and material mastery. Persistence is your greatest asset.', Gemini:'Vitality expressed through ideas and communication. Adaptability is your gift.', Cancer:'Deep connection to home and family shapes your core identity. Empathy is your strength.', Leo:'The Sun is at home here. Confidence, creativity, and generosity flow naturally.', Virgo:'Identity expressed through service and precision. Your attention to detail creates excellence.', Libra:'Self-expression seeks balance and harmony. Diplomacy is your art.', Scorpio:'Identity drawn to depth and transformation. Penetrating insight is your superpower.', Sagittarius:'Vitality fueled by philosophy and freedom. Optimism opens doors.', Capricorn:'Core drive is mastery and long-term achievement. Discipline creates legacy.', Aquarius:'Connected to ideas and collective progress. Originality is your contribution.', Pisces:'Identity fluid, compassionate, and spiritually oriented. Intuition is intelligence.' },
    Moon: { Aries:'Emotional security comes from action and capability. Quick responses need conscious direction.', Taurus:'Groundedness in comfort and constancy. Steadiness creates safety for others.', Gemini:'Emotions process best through conversation and mental engagement.', Cancer:'The Moon is home here. Deep nurturing gifts flow naturally — give from fullness.', Leo:'Feel secure when seen and creating. Generosity of spirit is magnetic.', Virgo:'Security through order and helpfulness. Practical care is love in action.', Libra:'Feel best in harmonious environments. Diplomatic gifts smooth conflicts.', Scorpio:'Emotional life runs deep and transformative. Honesty creates profound connections.', Sagittarius:'Mood lifts through learning and freedom. Optimism is your medicine.', Capricorn:'Security through achievement and reliability. Resilience in difficulty inspires others.', Aquarius:'Emotions processed through ideas and community. Vision for collective good is love.', Pisces:'Boundless compassion and deep intuition. Sensitivity is a form of wisdom.' },
    Mars: { Aries:'Direct, courageous, self-starting. Channel into meaningful challenges.', Taurus:'Sustained, methodical, extraordinary persistence. Slow and steady is your superpower.', Gemini:'Energy applied through ideas and variety. Multi-tasking is your strength.', Cancer:'Protective drive motivated by love. Fighting for loved ones brings out best qualities.', Leo:'Bold, dramatic, motivated by pride. Enthusiasm can ignite entire teams.', Virgo:'Precise, detail-oriented, focused on improvement. Mastery is your goal.', Libra:'Drive activated by fairness and partnership. Most powerful in collaboration.', Scorpio:'Intense, focused, built for depth. Persistence through obstacles is your gift.', Sagittarius:'Fueled by vision and truth. Enthusiasm for big ideas can inspire movements.', Capricorn:'Disciplined, goal-oriented, highly effective. You build things that last.', Aquarius:'Connected to collective causes. Fighting for systemic change is your calling.', Pisces:'Compassionate and creative energy. Artistic and healing work channels Mars beautifully.' },
    Jupiter: { Aries:'Expansion through leadership and bold initiatives.', Taurus:'Growth through patient accumulation and material wisdom.', Gemini:'Wisdom expressed through communication and intellectual breadth.', Cancer:'Exaltation sign. Abundance and nurturing wisdom flow generously.', Leo:'Generous leadership and creative expansion. Teaching and performance thrive.', Virgo:'Growth through service, analysis, and practical wisdom.', Libra:'Expansion through partnerships and justice. Diplomatic wisdom is your gift.', Scorpio:'Depth of wisdom and transformative knowledge. Occult and research talents.', Sagittarius:'Own sign. Natural philosopher, teacher, and explorer. Wisdom flows freely.', Capricorn:'Debilitation. Wisdom expressed cautiously but practically. Build with care.', Aquarius:'Humanitarian vision. Teaching and guiding collective progress.', Pisces:'Own sign and exaltation by some traditions. Spiritual abundance and compassion.' },
    Venus: { Aries:'Love expressed boldly and enthusiastically. Passion over patience.', Taurus:'Own sign. Deep appreciation of beauty, comfort, and sensory pleasure. Natural artist.', Gemini:'Love through conversation and intellectual connection. Variety in relationships.', Cancer:'Nurturing affection. Home and family are expressions of love.', Leo:'Dramatic, generous love. Loyalty and creative expression in relationships.', Virgo:'Love expressed through service and attention to detail. Practical devotion.', Libra:'Own sign. Natural diplomat in love. Beauty, harmony, and fairness in relationships.', Scorpio:'Intense, transformative love. Deep loyalty and emotional depth.', Sagittarius:'Freedom-loving approach to relationships. Philosophical and adventurous.', Capricorn:'Love expressed through commitment and reliability. Long-term relationships thrive.', Aquarius:'Unconventional love. Friendship and intellectual connection are foundations.', Pisces:'Exaltation sign. Deep compassion, romantic idealism, and spiritual love.' },
    Saturn: { Aries:'Debilitation. Impatience meets restriction — the invitation is to slow down and plan.', Taurus:'Disciplined approach to building material security. Patience yields abundance.', Gemini:'Structured communication and disciplined learning. Depth over breadth.', Cancer:'Challenges around emotional expression. The work is allowing vulnerability.', Leo:'Authority through service rather than ego. Leadership earned through discipline.', Virgo:'Methodical, exacting, perfectionistic. Mastery through sustained attention.', Libra:'Exaltation. Disciplined fairness and structured harmony. Justice as spiritual practice.', Scorpio:'Intense discipline. Deep transformation through sustained effort.', Sagittarius:'Disciplined philosophy and structured belief systems.', Capricorn:'Own sign. Natural authority, discipline, and long-term thinking.', Aquarius:'Own sign. Disciplined vision for collective progress and humanitarian structures.', Pisces:'Spiritual discipline and structured compassion. Mystical practice requires structure.' }
  },

  // ── Nakshatra Insights ─────────────────────────────────────────────────────
  nakshatra: {
    'Ashwini':'Pioneering healer. You arrive with fresh solutions. Quick starters, natural athletes, healers.',
    'Bharani':'Carrier of transformation. You complete what others abandon. Deep accountability and creative power.',
    'Krittika':'Sharp discernment. You cut through illusion to truth. Purifying fire that burns away what is false.',
    'Rohini':'Natural magnet for beauty and growth. Sensualist and creator. What you nurture, flourishes.',
    'Mrigashira':'Eternal seeker. Your restless curiosity finds meaning everywhere. Gentle, searching, poetic.',
    'Ardra':'Born from the storm. Transformation through intensity. Periods of chaos precede your deepest insights.',
    'Punarvasu':'Return to joy. You have an extraordinary capacity to restore and renew after difficulty.',
    'Pushya':'Nourisher of all. Wisdom-keeper and caretaker. Others feel safe in your presence.',
    'Ashlesha':'Serpent wisdom. Penetrating psychological insight and the ability to see hidden truths.',
    'Magha':'Royal lineage. Connected to ancestry and authority. Honoring your roots empowers your future.',
    'Purva Phalguni':'Creative abundance. Joy, pleasure, and artistic expression are sacred for you.',
    'Uttara Phalguni':'Partnership and service create your greatest achievements. You give the world beauty and order.',
    'Hasta':'Master craftsperson. Extraordinary skill in everything you touch. Dexterous mind and hands.',
    'Chitra':'Architect of beauty. Vision for design — spaces, relationships, ideas. You shape worlds.',
    'Swati':'Wind of independence. Grace and adaptability. Your freedom is your greatest strength.',
    'Vishakha':'Purposeful achiever. Driven by a mission that feels destined. Patience opens the door.',
    'Anuradha':'Devoted friend and partner. Deep loyalty transforms those you commit to.',
    'Jyeshtha':'Elder protector. Natural authority used in service of others. Courage in leadership.',
    'Mula':'Root-seeker. Drawn to the source of all things. Transformation through releasing the non-essential.',
    'Purva Ashadha':'Invincible inner strength. You carry hope into impossible situations.',
    'Uttara Ashadha':'Enduring victory. What you build is meant to last for generations.',
    'Shravana':'The Listener. Absorber and transmitter of wisdom. Your greatest intelligence is your attention.',
    'Dhanishtha':'Rhythm and abundance. Natural timing in all things — music, resources, relationships.',
    'Shatabhisha':'Healer of mysteries. You process the world differently — that is your advantage.',
    'Purva Bhadrapada':'Passionate transformer. Deep fire consciously directed becomes extraordinary creation.',
    'Uttara Bhadrapada':'Serene depth. Profound inner resources give you calm in any storm.',
    'Revati':'Compassionate guide. You mark the completion of one cycle and the beginning of the next.'
  },

  // ── Dasha Lords ────────────────────────────────────────────────────────────
  dasha: {
    Sun:    { theme:'Identity & Clarity', summary:'A period of stepping into authority and self-discovery. Questions of purpose, recognition, and leadership arise.', strategy:'Clarify what you truly want. Lead consciously, not reactively.' },
    Moon:   { theme:'Emotions & Nurturing', summary:'An emotionally rich chapter. Home, family, intuition, and inner life take priority.', strategy:'Develop emotional intelligence. Heal old patterns. Nurture yourself first.' },
    Mars:   { theme:'Drive & Courage', summary:'A period of action, ambition, and energetic effort. Projects requiring courage thrive.', strategy:'Start what you have been delaying. Direct the fire consciously.' },
    Rahu:   { theme:'Expansion & Ambition', summary:'Unusual growth and new experiences — sometimes disorienting but potentially transformative.', strategy:'Embrace the unfamiliar. Clarity of values anchors you in the expansion.' },
    Jupiter:{ theme:'Wisdom & Abundance', summary:'Often the most auspicious dasha. Growth in wisdom, opportunity, and abundance.', strategy:'Study, teach, travel, expand. What you invest in now compounds.' },
    Saturn: { theme:'Discipline & Karmic Harvest', summary:'Patience, responsibility, and sustained effort. What was avoided now needs attention.', strategy:'Build slowly and methodically. Saturn rewards genuine effort over time.' },
    Mercury:{ theme:'Communication & Intellect', summary:'A period favoring mental work, learning, and business. Agility of mind is your asset.', strategy:'Write, study, trade, negotiate. Trust your analytical conclusions.' },
    Ketu:   { theme:'Detachment & Spirituality', summary:'A turning inward. Dissolving what no longer serves, deepening spiritual awareness.', strategy:'Release old attachments with grace. Spiritual practice and introspection flourish.' },
    Venus:  { theme:'Love, Beauty & Creativity', summary:'A period of enjoyment, relationship depth, and creative flourishing.', strategy:'Invest in relationships, art, beauty, and pleasure. Abundance is available.' }
  },

  // ── Moon Transit Daily Vibe ────────────────────────────────────────────────
  moonVibe: {
    Aries:      { emoji:'🔥', vibe:'High Energy & Initiative', forecast:'Moon in Aries stirs action and initiative. Channel impulse into courage.', good:'Starting projects, physical activity, bold conversations', avoid:'Reactive arguments — breathe before replying' },
    Taurus:     { emoji:'🌿', vibe:'Grounded & Sensory', forecast:'Moon in Taurus — comfort, beauty, and steadiness are in the air.', good:'Creative work, financial decisions, meaningful rest, good food', avoid:'Forcing change. Today supports deepening, not disrupting' },
    Gemini:     { emoji:'💬', vibe:'Curious & Communicative', forecast:'Moon in Gemini quickens the mind. Ideas flow freely.', good:'Writing, learning, networking, brainstorming, catching up', avoid:'Scattering energy. Choose three priorities' },
    Cancer:     { emoji:'🌊', vibe:'Intuitive & Nurturing', forecast:'Moon is home in Cancer. Feelings run deeper today — honor them.', good:'Family time, emotional conversations, cooking, journaling, self-care', avoid:'Suppressing feelings. They are information, not obstacles' },
    Leo:        { emoji:'☀️', vibe:'Expressive & Generous', forecast:'Moon in Leo wants to celebrate and be seen. Warmth and generosity are natural.', good:'Creative expression, leadership, social events, joy', avoid:'Seeking external validation. The real audience today is yourself' },
    Virgo:      { emoji:'📋', vibe:'Organized & Detail-Oriented', forecast:'Moon in Virgo sharpens your eye for detail. Productivity feels natural.', good:'Organizing, health habits, problem-solving, planning', avoid:'Perfectionism that prevents completion. Done beats ideal' },
    Libra:      { emoji:'⚖️', vibe:'Harmonious & Reflective', forecast:'Moon in Libra seeks balance and beauty. Relationships take center stage.', good:'Negotiation, design, socializing, seeing all sides', avoid:'Over-accommodating. Your needs are as valid as everyone else\'s' },
    Scorpio:    { emoji:'🔮', vibe:'Intense & Perceptive', forecast:'Moon in Scorpio deepens everything — perception, emotion, and connection.', good:'Research, deep conversations, healing work, psychological insight', avoid:'Suspicion without evidence. Not everything hidden is a threat' },
    Sagittarius:{ emoji:'🏹', vibe:'Expansive & Philosophical', forecast:'Moon in Sagittarius lifts the mood and broadens perspective.', good:'Learning, travel, philosophy, setting long-term intentions', avoid:'Over-promising. Ground enthusiasm in what\'s achievable' },
    Capricorn:  { emoji:'🏔️', vibe:'Disciplined & Strategic', forecast:'Moon in Capricorn brings seriousness and ambition.', good:'Planning, professional matters, disciplined effort, setting structures', avoid:'Emotional coldness. Efficiency and warmth are not opposites' },
    Aquarius:   { emoji:'⚡', vibe:'Innovative & Communal', forecast:'Moon in Aquarius sparks originality and social consciousness.', good:'Group work, innovation, humanitarian causes, original thinking', avoid:'Emotional detachment. Your feelings and ideas both deserve space' },
    Pisces:     { emoji:'🌸', vibe:'Dreamy & Compassionate', forecast:'Moon in Pisces softens boundaries and heightens intuition.', good:'Creative work, meditation, spiritual practice, art, compassionate listening', avoid:'Escapism. Gentle rest is healthy; numbing is different' }
  },

  // ── Hindu Festivals 2024-2026 ─────────────────────────────────────────────
  festivals: [
    { date:'2024-01-22', name:'Ram Mandir Pran Pratishtha', type:'special' },
    { date:'2024-01-25', name:'Mauni Amavasya', type:'vrat' },
    { date:'2024-02-14', name:'Vasant Panchami', type:'festival' },
    { date:'2024-03-08', name:'Maha Shivratri', type:'major' },
    { date:'2024-03-25', name:'Holi', type:'major' },
    { date:'2024-04-09', name:'Ram Navami', type:'major' },
    { date:'2024-04-14', name:'Baisakhi / Ambedkar Jayanti', type:'festival' },
    { date:'2024-04-17', name:'Hanuman Jayanti', type:'festival' },
    { date:'2024-05-23', name:'Buddha Purnima', type:'festival' },
    { date:'2024-06-17', name:'Eid ul-Adha (Bakrid)', type:'festival' },
    { date:'2024-07-17', name:'Guru Purnima', type:'major' },
    { date:'2024-08-19', name:'Raksha Bandhan', type:'major' },
    { date:'2024-08-26', name:'Janmashtami', type:'major' },
    { date:'2024-09-07', name:'Ganesh Chaturthi', type:'major' },
    { date:'2024-10-02', name:'Gandhi Jayanti / Mahalaya', type:'festival' },
    { date:'2024-10-12', name:'Navratri Begins', type:'major' },
    { date:'2024-10-13', name:'Karwa Chauth', type:'vrat' },
    { date:'2024-10-20', name:'Dussehra', type:'major' },
    { date:'2024-10-29', name:'Dhanteras', type:'major' },
    { date:'2024-11-01', name:'Diwali', type:'major' },
    { date:'2024-11-02', name:'Govardhan Puja', type:'festival' },
    { date:'2024-11-03', name:'Bhai Dooj', type:'festival' },
    { date:'2024-11-15', name:'Chhath Puja', type:'major' },
    { date:'2024-12-11', name:'Gita Jayanti', type:'festival' },
    { date:'2024-12-25', name:'Christmas', type:'festival' },
    { date:'2025-01-14', name:'Makar Sankranti / Pongal', type:'major' },
    { date:'2025-01-29', name:'Mauni Amavasya', type:'vrat' },
    { date:'2025-02-02', name:'Vasant Panchami', type:'festival' },
    { date:'2025-02-12', name:'Maha Shivratri', type:'major' },
    { date:'2025-03-14', name:'Holi', type:'major' },
    { date:'2025-03-30', name:'Ram Navami', type:'major' },
    { date:'2025-04-06', name:'Hanuman Jayanti', type:'festival' },
    { date:'2025-04-13', name:'Baisakhi', type:'festival' },
    { date:'2025-05-12', name:'Buddha Purnima', type:'festival' },
    { date:'2025-07-10', name:'Guru Purnima', type:'major' },
    { date:'2025-08-09', name:'Raksha Bandhan', type:'major' },
    { date:'2025-08-16', name:'Janmashtami', type:'major' },
    { date:'2025-08-27', name:'Ganesh Chaturthi', type:'major' },
    { date:'2025-09-22', name:'Navratri Begins', type:'major' },
    { date:'2025-10-02', name:'Karwa Chauth', type:'vrat' },
    { date:'2025-10-02', name:'Gandhi Jayanti', type:'festival' },
    { date:'2025-10-20', name:'Diwali', type:'major' },
    { date:'2025-11-05', name:'Chhath Puja', type:'major' },
    { date:'2026-01-14', name:'Makar Sankranti', type:'major' },
    { date:'2026-03-02', name:'Maha Shivratri', type:'major' },
    { date:'2026-03-21', name:'Holi', type:'major' }
  ],

  // ── Bhagavad Gita Daily Verses ────────────────────────────────────────────
  gitaVerses: [
    { verse:'2.47', text:'You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.' },
    { verse:'2.20', text:'For the soul there is never birth nor death at any time. It has not come into being, does not come into being, and will not come into being. It is unborn, eternal, ever-existing, and primeval.' },
    { verse:'3.27', text:'The bewildered spirit soul, under the influence of the three modes of material nature, thinks himself to be the doer of activities, while the real doer is the Supreme Lord.' },
    { verse:'4.7', text:'Whenever and wherever there is a decline in religious practice and a predominant rise of irreligion — at that time I descend Myself.' },
    { verse:'6.5', text:'One must deliver himself with the help of his mind, and not degrade himself. The mind is the friend of the conditioned soul, and his enemy as well.' },
    { verse:'9.22', text:'But those who always worship Me with exclusive devotion, meditating on My transcendental form — to them I carry what they lack, and I preserve what they have.' },
    { verse:'10.20', text:'I am the Self, Arjuna, seated in the heart of all creatures. I am the beginning, middle and end of all beings.' },
    { verse:'11.33', text:'Therefore, rise and seek glory. Conquer your enemies and enjoy a flourishing kingdom. All these men have already been killed by My arrangement; you are simply an instrument.' },
    { verse:'12.15', text:'He for whom no one is put into difficulty and who is not disturbed by anyone, who is equipoised in happiness and distress, fear and anxiety, is very dear to Me.' },
    { verse:'18.66', text:'Abandon all varieties of religion and just surrender unto Me. I shall deliver you from all sinful reactions. Do not fear.' }
  ],

  // ── Weather Philosophy Cards ──────────────────────────────────────────────
  philosophyCards: [
    { icon:'🌦️', title:'Weather, Not Fate', text:'Planets show the atmosphere. You choose the response.' },
    { icon:'🔬', title:'Transparent Math', text:'Every insight shows its astronomical source — no magic, only mathematics.' },
    { icon:'🛡️', title:'Strategy Language', text:"No 'bad luck' — only growth opportunities and conscious navigation." },
    { icon:'🔒', title:'100% Private', text:'Your data never leaves your device. No servers. No tracking. Ever.' },
    { icon:'🌱', title:'Growth Over Prediction', text:'We show tendencies, not fate. You are the author of your story.' },
    { icon:'⚖️', title:'Science + Tradition', text:'Combining NASA-grade astronomy with 5,000 years of Vedic observation.' },
    { icon:'🧘', title:'Self-Study (Svādhyāya)', text:'One of the Niyamas in Yoga — the study of the self through reflection.' },
    { icon:'🌐', title:'Universal Tool', text:'Works offline. Works for every city on Earth. Works in all languages.' }
  ]
};
