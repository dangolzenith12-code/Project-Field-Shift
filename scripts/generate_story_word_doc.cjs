const fs = require('fs');
const path = require('path');

const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<title>Field Shift: Four Seasons of Amma's Field - Master Story & Mini-Games Guide</title>
<!--[if gte mso 9]>
<xml>
 <w:WordDocument>
  <w:View>Print</w:View>
  <w:Zoom>100</w:Zoom>
  <w:DoNotOptimizeForBrowser/>
 </w:WordDocument>
</xml>
<![endif]-->
<style>
  @page {
    size: 8.5in 11.0in;
    margin: 1.0in 1.0in 1.0in 1.0in;
    mso-header-margin: 0.5in;
    mso-footer-margin: 0.5in;
  }
  body {
    font-family: 'Segoe UI', Calibri, Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: #ffffff;
  }
  h1 {
    font-size: 24pt;
    font-weight: bold;
    color: #0b3d20;
    border-bottom: 3px solid #00a854;
    padding-bottom: 6px;
    margin-top: 24pt;
    margin-bottom: 12pt;
    page-break-before: always;
  }
  h1.cover-title {
    page-break-before: avoid;
    font-size: 30pt;
    color: #0b3d20;
    border-bottom: none;
    margin-top: 40pt;
    margin-bottom: 8pt;
  }
  h2 {
    font-size: 16pt;
    font-weight: bold;
    color: #1b4d3e;
    border-bottom: 1.5px solid #dcdcdc;
    padding-bottom: 4px;
    margin-top: 18pt;
    margin-bottom: 8pt;
  }
  h3 {
    font-size: 13pt;
    font-weight: bold;
    color: #2e6f40;
    margin-top: 14pt;
    margin-bottom: 6pt;
  }
  p {
    margin-top: 0;
    margin-bottom: 8pt;
  }
  .cover-card {
    background-color: #f4fbf7;
    border: 2px solid #00a854;
    padding: 24pt;
    margin-bottom: 30pt;
  }
  .tagline {
    font-size: 14pt;
    color: #333333;
    font-weight: 600;
    margin-bottom: 16pt;
  }
  .meta-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16pt;
  }
  .meta-table td {
    padding: 6pt 10pt;
    border: 1px solid #c2e2cf;
    font-size: 10pt;
  }
  .meta-label {
    font-weight: bold;
    background-color: #e5f5eb;
    color: #0b3d20;
    width: 28%;
  }
  .dialogue-box {
    background-color: #fbfbfb;
    border-left: 5px solid #2e6f40;
    padding: 10pt 14pt;
    margin: 8pt 0 14pt 0;
  }
  .dialogue-speaker {
    font-weight: bold;
    color: #0b3d20;
    font-size: 11pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4pt;
  }
  .dialogue-text {
    font-style: normal;
    color: #222222;
    margin-bottom: 4pt;
  }
  .dialogue-sfx {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 9pt;
    color: #8c5b00;
    font-weight: bold;
    margin-bottom: 6pt;
  }
  .game-trigger-card {
    background-color: #fff9e6;
    border: 2px dashed #b8860b;
    padding: 14pt;
    margin: 14pt 0;
    page-break-inside: avoid;
  }
  .game-title {
    font-weight: bold;
    font-size: 12pt;
    color: #7d5a00;
    margin-bottom: 6pt;
    text-transform: uppercase;
  }
  .nasa-card {
    background-color: #eef6ff;
    border-left: 5px solid #0056b3;
    padding: 10pt 14pt;
    margin: 10pt 0;
  }
  .nasa-title {
    font-weight: bold;
    color: #003d80;
    font-size: 10.5pt;
    margin-bottom: 4pt;
  }
  table.content-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
  }
  table.content-table th {
    background-color: #0b3d20;
    color: #ffffff;
    padding: 8pt;
    font-size: 10pt;
    text-align: left;
    border: 1px solid #0b3d20;
  }
  table.content-table td {
    padding: 8pt;
    font-size: 9.5pt;
    border: 1px solid #dddddd;
    vertical-align: top;
  }
  table.content-table tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  .choice-bubble {
    background-color: #f0f4f8;
    border: 1px solid #bcd0e4;
    padding: 5pt 10pt;
    margin: 4pt 0;
    font-size: 9.5pt;
    color: #1a3a5a;
  }
  .badge {
    display: inline-block;
    padding: 2px 6px;
    font-size: 8pt;
    font-weight: bold;
    border-radius: 3px;
    color: #ffffff;
  }
  .badge-nasa { background-color: #0056b3; }
  .badge-game { background-color: #b8860b; }
  .badge-story { background-color: #0b3d20; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover-card">
  <div style="font-size: 11pt; color: #00a854; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
    NASA SPACE APPS CHALLENGE 2024 &bull; AGRO-ECOLOGICAL SIMULATION
  </div>
  <h1 class="cover-title">FIELD SHIFT: FOUR SEASONS OF AMMA'S FIELD</h1>
  <div class="tagline">The Master Story Bible, Dialogue Script & Interactive Mini-Game Design</div>
  <p>
    An educational climate simulation game bridging traditional generational farming wisdom with open NASA Earth Observation satellite telemetry.
  </p>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Project Name</td>
      <td><strong>Field Shift: Four Seasons of Amma's Field</strong></td>
    </tr>
    <tr>
      <td class="meta-label">Target Aesthetic</td>
      <td>GBA / 16-Bit Retro Pixel RPG (Zero Emojis &bull; Pure Arcade Glyphs)</td>
    </tr>
    <tr>
      <td class="meta-label">Primary Protagonists</td>
      <td>Young Farmer Hari &amp; Amma (Matriarch of Kisanpur)</td>
    </tr>
    <tr>
      <td class="meta-label">The 4 Demo Regions</td>
      <td>
        1. <strong>Karnataka, India</strong> (Rain-fed Ragi &amp; Pulses &bull; Deccan Plateau)<br>
        2. <strong>Punjab, India</strong> (Wheat-Rice &bull; Deep Aquifer Stress)<br>
        3. <strong>Iowa, USA</strong> (Corn-Soy Prairie &bull; Cloudburst Erosion)<br>
        4. <strong>Sahel / Kenya</strong> (Savanna Fringe &bull; 46&deg;C Extreme Heat &amp; Za&iuml; Pits)
      </td>
    </tr>
    <tr>
      <td class="meta-label">NASA Satellites Integrated</td>
      <td>
        &bull; <strong>SMAP</strong> (Soil Moisture Active Passive Radar)<br>
        &bull; <strong>GRACE &amp; GRACE-FO</strong> (Twin Gravity Anomaly Satellites)<br>
        &bull; <strong>GPM &amp; SWOT</strong> (Global Precipitation &amp; Surface Water Radar)<br>
        &bull; <strong>MERRA-2 &amp; ECOSTRESS</strong> (Thermal Flux &amp; Plant Transpiration)
      </td>
    </tr>
    <tr>
      <td class="meta-label">Document Version</td>
      <td>Master Release 1.0 &bull; November 2026</td>
    </tr>
  </table>
</div>

<!-- SECTION 1 -->
<h1>SECTION 1: ARCHITECTURAL OVERVIEW</h1>
<h2>Dual Experience Modes</h2>
<p>
  <strong>Field Shift</strong> provides two complementary game experiences to meet both narrative and exploratory simulation needs:
</p>

<table class="content-table">
  <tr>
    <th style="width: 50%;">MODE 1: LINEAR STORY CAMPAIGN</th>
    <th style="width: 50%;">MODE 2: OPEN GBA OVERWORLD</th>
  </tr>
  <tr>
    <td>
      <strong>Primary Audience:</strong> Evaluators, story players, classroom demos.<br><br>
      <strong>Structure:</strong> A continuous 5-Act cinematic story that takes Young Farmer Hari on an international mission across all 4 demo regions sequentially.<br><br>
      <strong>Progression:</strong><br>
      Karnataka ➔ Punjab ➔ Iowa ➔ Sahel ➔ Global Summit Finale.<br><br>
      <strong>Gameplay:</strong> Every 2-3 minutes of dramatic narrative culminates in a direct, mandatory hands-on arcade mini-game that tests the player's grasp of the regional climate challenge.
    </td>
    <td>
      <strong>Primary Audience:</strong> Free-roam exploration, replayability, deep data analysis.<br><br>
      <strong>Structure:</strong> A top-down 2D pixel RPG overworld where the player can walk, interact with NPCs, and freely travel to any of the 4 independent regional stories.<br><br>
      <strong>Progression:</strong><br>
      Non-linear sandbox. The player opens the Region Selector at any time to inhabit Karnataka, Punjab, Iowa, or Sahel.<br><br>
      <strong>Gameplay:</strong> Walking in 2D space, inspecting physical sensors (weather post, borewell, soil plots), talking to regional farmers, and launching individual mini-games on demand.
    </td>
  </tr>
</table>

<!-- SECTION 2 -->
<h1>SECTION 2: THE 4 DEMO REGIONS &amp; NASA TELEMETRY MATRIX</h1>
<p>
  Each region demonstrates a distinct agro-ecological biome, socioeconomic structure, and NASA Earth Observation instrument:
</p>

<table class="content-table">
  <tr>
    <th>Region</th>
    <th>Landscape &amp; Soil</th>
    <th>Climate Threat</th>
    <th>Host Character</th>
    <th>NASA Instrument</th>
    <th>Interactive Mini-Game</th>
  </tr>
  <tr>
    <td><strong>1. Karnataka, India</strong><br><em>(Deccan Plateau)</em></td>
    <td>Red gravelly loam soil with rapid drainage and fragile surface crust.</td>
    <td>Delayed monsoon; deceptive surface dryness; 25-day vegetative dry spells.</td>
    <td><strong>Amma</strong><br>(Farm Matriarch)</td>
    <td><strong>SMAP</strong><br>Soil Moisture Active Passive L-band radar.</td>
    <td><strong>Precision Sowing Drill</strong><br>Hit the 4.0-6.5 cm moisture band with furrow timing.</td>
  </tr>
  <tr>
    <td><strong>2. Punjab, India</strong><br><em>(Indo-Gangetic Basin)</em></td>
    <td>Deep alluvial clay/silt; high historical fertility; intensive irrigation canals.</td>
    <td>Deep aquifer collapse (-1.2 m/yr); saline intrusion; tubewell cavitation.</td>
    <td><strong>Gurpreet</strong><br>(Monoculture Cousin)</td>
    <td><strong>GRACE-FO</strong><br>Twin satellites measuring gravity mass changes.</td>
    <td><strong>Tubewell Aquifer Balancer</strong><br>Throttle 3 plot valves while preserving the water table.</td>
  </tr>
  <tr>
    <td><strong>3. Iowa, USA</strong><br><em>(Corn Belt)</em></td>
    <td>Deep Mollisol black prairie soil; rolling glacial till hillsides.</td>
    <td>Extreme 120 mm rain bombs; devastating sheet and gully topsoil erosion.</td>
    <td><strong>Sarah</strong><br>(Prairie Conservationist)</td>
    <td><strong>GPM + SWOT</strong><br>Rainfall radar and surface water elevation.</td>
    <td><strong>Sluice Runoff &amp; Cover Crops</strong><br>Route storm water into grassed buffer strips.</td>
  </tr>
  <tr>
    <td><strong>4. Sahel / Kenya</strong><br><em>(Savanna Fringe)</em></td>
    <td>Arenosol coarse sand; high soil crusting; 9-month annual dry season.</td>
    <td>Brutal 46&deg;C atmospheric heat dome; plant stomata collapse in 48 hours.</td>
    <td><strong>Amina</strong><br>(Za&iuml; Pit Specialist)</td>
    <td><strong>MERRA-2 + ECOSTRESS</strong><br>Thermal reanalysis &amp; plant evapotranspiration.</td>
    <td><strong>45&deg;C Heatwave Bio-Shield</strong><br>Rapidly deploy mulch, agro-shade, and drip mist.</td>
  </tr>
</table>

<!-- SECTION 3 -->
<h1>SECTION 3: COMPLETE SCRIPT &amp; DIALOGUE FLOW (LINEAR MODE)</h1>

<h2>PROLOGUE: THE CALL FROM KISANPUR</h2>
<p><em>Setting: The ancestral veranda at sunset. Crickets chirp softly. Young Farmer Hari walks in with a travel pack and a handheld NASA satellite terminal. Amma sits on a wooden charpai, sorting heirloom seeds into brass bowls.</em></p>
<div class="dialogue-sfx">[SFX: GBA_HARMONIC_CHIME &bull; 8-BIT ACOUSTIC MELODY]</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma</div>
  <div class="dialogue-text">"Hari! You return just as the red dust settles. Look at these seeds... your great-grandfather saved this Ragi strain through the great drought of 1972. Five generations have trusted this earth."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Amma, it is good to be home. But on my walk from the bus stand, I saw the cracked furrows. The elders were arguing by the village well."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma</div>
  <div class="dialogue-text">"They are frightened, my boy. For forty years, the Rohini rains arrived by the new moon. But now the sky stays empty for weeks, only to pour three inches in a single violent hour. Some want to sell their cows. Others want to buy chemical fertilizer on heavy debt and pray."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"The old calendar is falling out of sync with the climate, Amma. But look at this handheld terminal. The NASA SMAP satellite passed over our district this morning. It sees what our eyes cannot. The moisture is not gone&mdash;it has shifted deeper underground."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma</div>
  <div class="dialogue-text">"Can a metal bird flying higher than the clouds truly understand the thirst of our red earth? Show me, Hari. Prove what your eyes in the sky can do."</div>
</div>

<h2>ACT 1: KARNATAKA &bull; SOWING IN THE DECEPTIVE DUST</h2>
<p><em>Setting: The Northern Terraced Field. Red soil stretches across the slope. Hot pre-monsoon wind whistles through the dry grass.</em></p>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Look at the telemetry readout, Amma. The top 2 centimeters are dry as bone from three weeks of 38&deg;C heat. If we scatter seeds on top like the elders did, the hot wind will bake them before sunset. But look 5 centimeters down: SMAP radar shows 28% volumetric moisture trapped under the crust!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma</div>
  <div class="dialogue-text">"The moisture band! But the furrow drill must place the Ragi grain exactly in that wet layer. Too shallow, it bakes. Too deep, the seedling suffocates in the hardpan."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"I will guide the furrow drill myself. I'll watch the SMAP depth telemetry and drop the seeds on the exact mark!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma</div>
  <div class="dialogue-text">"Take my blessing, Hari. Let us see if your modern tools have the patience of the ancestors."</div>
</div>

<!-- GAME 1 CARD -->
<div class="game-trigger-card">
  <div class="game-title">&#9670; MINI-GAME 1: PRECISION SOWING TIMING DRILL</div>
  <p><strong>Region:</strong> Karnataka, India &bull; <strong>NASA Mission:</strong> SMAP (Soil Moisture Active Passive)</p>
  <p><strong>Objective:</strong> An oscillating depth meter swings continuously between 0.0 cm (surface bake) and 10.0 cm (dense bedrock). Press <strong>SPACEBAR / SOW BUTTON</strong> as the indicator passes through the green <strong>SMAP Optimal Moisture Zone [4.0 cm &ndash; 6.5 cm]</strong>.</p>
  <p><strong>Target:</strong> Successfully plant 5 seeds. Hitting the optimal zone awards +25 Soil Resilience and triggers Amma's praise.</p>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma (After Game Completion)</div>
  <div class="dialogue-text">"Every grain settled straight into the cool wet sub-layer! The seeds are safe under the dust. But Hari... our family is not the only one facing a changing sky. Yesterday, your cousin Gurpreet called from Punjab. He was shouting over the deafening roar of three diesel engines. Go north, Hari. Help him before he drains the earth empty."</div>
</div>

<h2>ACT 2: PUNJAB &bull; THE ROARING TUBEWELLS</h2>
<p><em>Setting: Lush green rice paddies stretching to the horizon. Thick black diesel exhaust rises from heavy 50-HP tubewell pumps thumping violently.</em></p>
<div class="dialogue-sfx">[SFX: DIESEL_MOTOR_CHUG &bull; WATER_TORRENT_LOOP]</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Gurpreet</div>
  <div class="dialogue-text">"Hari, little brother! Welcome to the breadbasket of the nation! Look at this water gushing out! The government gives us free farm electricity, so my pumps run 24 hours a day, 7 days a week. Paddy in summer, wheat in winter! Who cares about rain when the underground ocean has no bottom?"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Gurpreet-bhai, turn off pump number two for a second. Listen to the engine... it's coughing sand. Dip your finger in that discharge ditch and taste it."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Gurpreet</div>
  <div class="dialogue-text">"Bah! So it tastes slightly bitter. The rice plants don't mind. They grow tall!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"That bitterness is deep saline water. Look at this gravity anomaly map from NASA's GRACE twin satellites. These spacecraft measure subtle variations in Earth's gravitational field caused by moving water mass. The underground water mass under our district has dropped by 1.2 meters every single year since 2002!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Gurpreet</div>
  <div class="dialogue-text">"A satellite... weighing the underground water? You mean... the aquifer is actually drying out?"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Your borewells are down to 320 feet. If this sub-aquifer collapses, the saline layer will sterilize your topsoil for decades. Look at your plots right now&mdash;the pump pressure is spiking. We must balance the manifold valves before the pump cavitates!"</div>
</div>

<!-- GAME 2 CARD -->
<div class="game-trigger-card">
  <div class="game-title">&#9670; MINI-GAME 2: TUBEWELL VALVE &amp; AQUIFER BALANCER</div>
  <p><strong>Region:</strong> Punjab, India &bull; <strong>NASA Mission:</strong> GRACE &amp; GRACE-FO</p>
  <p><strong>Objective:</strong> 3 crop plots (Basmati Rice, Wheat Seedlings, Green Fodder) require hydration before their 15-second wilting timers run out. A central <strong>NASA GRACE Aquifer Reservoir Gauge</strong> steadily drains whenever valves are open.</p>
  <p><strong>Mechanic:</strong> Open and throttle 3 individual plot valves. Balance water delivery so all 3 plots reach 75% hydration while keeping the Aquifer Reserve above the critical red-line threshold (30%).</p>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Gurpreet (After Game Completion)</div>
  <div class="dialogue-text">"Look at that... all three fields are satisfied, but the well pressure stayed steady! We cut our diesel consumption by half! If we combine this with Laser Land Leveling, we can preserve this well for my children."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Direct-Seeded Rice will save another 35% of water next season. But look at this global alert on my terminal... an emergency bulletin from the American Midwest. Violent cloudbursts are ripping through Iowa's prairies. We have to go."</div>
</div>

<h2>ACT 3: IOWA, USA &bull; THE PRAIRIE CLOUDBURST</h2>
<p><em>Setting: Rolling hills of dark black prairie loam. Giant purple-black thunderheads loom over the corn rows. Distant thunder rumbles violently.</em></p>
<div class="dialogue-sfx">[SFX: THUNDER_CRACK &bull; WIND_WHISTLE]</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Sarah</div>
  <div class="dialogue-text">"Hari! Good of you to make it out here to the Corn Belt. We used to get gentle two-inch soakers that lasted three days. But look at that storm cell rolling in from Nebraska. It's a wall of purple water."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"NASA's GPM satellite radar measured precipitation intensity at 92 millimeters per hour inside that squall line. That is an extreme flash deluge."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Sarah</div>
  <div class="dialogue-text">"Most of my neighbors left their fields as bare black dirt after corn harvest. When 90 mm of rain hits bare soil on a 6% slope, it acts like liquid sandpaper. It will gouge 4-foot gullies and wash 12 tons of topsoil per acre straight down into the Mississippi River!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Did you establish the winter rye cover crops along the lower contour terrace?"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Sarah</div>
  <div class="dialogue-text">"The rye is rooted, but the culvert sluice gate is jammed half-shut! If that runoff water dams up behind the tractor road, the whole terrace will blow out in two minutes! Help me route the storm flow into the grassed waterways!"</div>
</div>

<!-- GAME 3 CARD -->
<div class="game-trigger-card">
  <div class="game-title">&#9670; MINI-GAME 3: SLUICE RUNOFF &amp; COVER CROP EROSION SHIELD</div>
  <p><strong>Region:</strong> Iowa, USA &bull; <strong>NASA Mission:</strong> GPM (Precipitation) &amp; SWOT (Surface Water)</p>
  <p><strong>Objective:</strong> Torrential rainwater sheets flow down a cross-section of the rolling prairie slope toward the stream.</p>
  <p><strong>Mechanic:</strong> Click to open retention sluice gates, route excess floodwaters into grassed filtration swales, and reinforce winter rye buffer barriers before the Topsoil Loss Gauge exceeds 15%.</p>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Sarah (After Game Completion)</div>
  <div class="dialogue-text">"The storm passed! Look down at the creek&mdash;the water is running clear! The rye roots anchored the hillside, and the retention pond trapped all the silt. We didn't lose an inch of topsoil!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"NASA's SWOT satellite confirms the river basin level held safe. But Sarah... look at this satellite thermal composite from East Africa. The Sahara fringe is boiling."</div>
</div>

<h2>ACT 4: SAHEL / KENYA &bull; THE DESERT'S EDGE</h2>
<p><em>Setting: Sun-bleached red-gold savanna dotted with thorny acacia trees. Shimmering heat waves distort the horizon. The sky is a blinding, cloudless white.</em></p>
<div class="dialogue-sfx">[SFX: HEAT_SHIMMER_PULSE &bull; ALARM_CHIME]</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amina</div>
  <div class="dialogue-text">"Welcome to the transition belt, Hari. Step carefully&mdash;the sand is hot enough to melt plastic soles. The dry season has stretched to eight months."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Amina! The NASA MERRA-2 thermal sensors show canopy temperatures at 46.4&deg;C right now! And the ECOSTRESS instrument aboard the International Space Station shows plant evapotranspiration is shutting down. The leaves are closing their pores to survive!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amina</div>
  <div class="dialogue-text">"If their pores stay shut in this heat, the plant tissues boil in two hours. But we do not surrender to the sand. Look at these circular hollows I have dug across the field. In our language, we call them Za&iuml; pits."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Pockets packed with organic compost and termite manure! The termites dig micro-tunnels that let water break through the rock-hard surface crust!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amina</div>
  <div class="dialogue-text">"And right in the center, we planted ancient Pearl Millet. But the thermal wave is cresting at its absolute peak right now! We have straw mulch bundles, acacia shade canopies, and our solar drip mist. Help me shield these beds before the heat incinerates them!"</div>
</div>

<!-- GAME 4 CARD -->
<div class="game-trigger-card">
  <div class="game-title">&#9670; MINI-GAME 4: 45&deg;C HEATWAVE BIO-SHIELD DEFENSE</div>
  <p><strong>Region:</strong> Sahel / Kenya &bull; <strong>NASA Mission:</strong> MERRA-2 &amp; ECOSTRESS</p>
  <p><strong>Objective:</strong> 4 crop beds are exposed to severe atmospheric thermal radiation, with temperatures climbing toward fatal 48&deg;C.</p>
  <p><strong>Mechanic:</strong> Deploy 3 cooling tools under a 25-second countdown:<br>
  1. <strong>Straw Mulch:</strong> -6&deg;C root temperature reduction.<br>
  2. <strong>Agroforestry Shade Netting:</strong> -4&deg;C canopy heat block.<br>
  3. <strong>Pulse Drip Micro-Mist:</strong> -8&deg;C rapid evaporative cooling.<br>
  Keep all 4 beds below 35&deg;C until the sun sets.</p>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amina (After Game Completion)</div>
  <div class="dialogue-text">"The thermal peak has broken! Look at the millet leaves&mdash;crisp, upright, and deep emerald green! The ancient Za&iuml; pits and satellite thermal alerts pushed back the desert!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"From Karnataka's red soil, to Punjab's tubewells, to Iowa's prairie, to our African savanna... the challenge is identical. We must bring everyone together. Amma is preparing the Banyan Council in Kisanpur."</div>
</div>

<h2>ACT 5: THE GLOBAL AGROECOLOGY SUMMIT &bull; FINALE</h2>
<p><em>Setting: The sacred Banyan Tree in Kisanpur. Amma stands at the center with her brass thali. Gurpreet, Sarah, Amina, and local farming families gather around the council platform.</em></p>
<div class="dialogue-sfx">[SFX: TRIUMPHANT_GBA_FANFARE &bull; CONFETTI_BURST]</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma</div>
  <div class="dialogue-text">"Welcome, my children from across the four corners of the world. You stand upon the ground where our ancestors plowed for five hundred years. Hari... show the council what your journey has proved."</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Hari</div>
  <div class="dialogue-text">"Across all four agro-ecological zones, we ran a 10-year comparative analysis comparing three pathways:<br>
  1. Business-as-Usual Monoculture: 68% aquifer drawdown, massive topsoil loss, catastrophic heat failure.<br>
  2. Passive Traditional Farming: Vulnerable to unseasonal flash extremes.<br>
  3. Climate-Smart Agroecology with NASA Earth Observation:<br>
  &nbsp;&nbsp;&bull; 38% Regional Groundwater Saved (GRACE-FO)<br>
  &nbsp;&nbsp;&bull; Zero Topsoil Erosion during 90 mm Cloudbursts (GPM/SWOT)<br>
  &nbsp;&nbsp;&bull; 100% Crop Survival through 46&deg;C Heatwaves (MERRA-2)<br>
  &nbsp;&nbsp;&bull; 3.2x Higher Net Profit for Smallholder Families!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Gurpreet</div>
  <div class="dialogue-text">"In Punjab, we proved you do not need to pump the earth dry to grow golden grain!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Sarah</div>
  <div class="dialogue-text">"In Iowa, we proved cover crops and satellite precipitation telemetry keep the soil rich and rooted!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amina</div>
  <div class="dialogue-text">"In the Sahel, we proved heirloom seeds and Za&iuml; pits can push back the Sahara sand!"</div>
</div>

<div class="dialogue-box">
  <div class="dialogue-speaker">Amma</div>
  <div class="dialogue-text">"The wisdom of the elders, guided by eyes that circle the stars. The field is shifted. The future has taken root!"</div>
</div>

<!-- SECTION 4 -->
<h1>SECTION 4: THE GBA FREE-ROAM OVERWORLD SPECIFICATION</h1>
<h2>Top-Down Pixel Exploration &amp; Regional Travel</h2>
<p>
  When the player enters the <strong>GBA Overworld Mode</strong>, they navigate Young Farmer Hari across a live 2D canvas (960 &times; 720 resolution).
</p>

<h3>Key Locations on the GBA World Map:</h3>
<ol>
  <li><strong>Ancestral Farmhouse &amp; Courtyard:</strong> Meet Amma, inspect heirloom seed bags, and review the Farm Almanac.</li>
  <li><strong>Tubewell Pump Station:</strong> View real-time NASA GRACE groundwater aquifer levels.</li>
  <li><strong>Village Weather Post &amp; Anemometer:</strong> Access NASA POWER precipitation and temperature charts.</li>
  <li><strong>Terraced Crop Plots (North &amp; South):</strong> Inspect soil organic matter, root depth, and rotation history.</li>
  <li><strong>Sacred Banyan Tree:</strong> Consult the village agronomist and view 10-year Monte Carlo yield projections.</li>
  <li><strong>Village Travel Depot / Station Wagon:</strong> The gateway to freely switch between the 4 demo regions!</li>
</ol>

<h3>HUD Telemetry Gauges (Live Real-Time Indicators):</h3>
<ul>
  <li><strong>Soil Moisture % (SMAP Radar):</strong> Depletes during dry spells; recovers with rainfall and pulse drip.</li>
  <li><strong>Aquifer Head Reserve (GRACE Gravity):</strong> Drops when tubewells pump continuously; recharges via percolation basins.</li>
  <li><strong>Thermal Stress Index (MERRA-2):</strong> Measures canopy temperature; flashes crimson above 35&deg;C.</li>
  <li><strong>Biodiversity &amp; Resilience Score:</strong> Increases when intercropping millets and nitrogen-fixing legumes.</li>
</ul>

<div style="margin-top: 30pt; padding: 12pt; border-top: 2px solid #00a854; font-size: 9pt; color: #555555; text-align: center;">
  &copy; 2026 Team Field Shift &bull; NASA Space Apps Challenge &bull; Built with Svelte 5 &bull; Open NASA Earth Science Data
</div>

</body>
</html>
`;

// Write the .doc file to root and docs/
const rootDocPath = path.resolve(__dirname, '..', 'FIELD_SHIFT_MASTER_STORY_AND_GAMES.doc');
const docsDocPath = path.resolve(__dirname, '..', 'docs', 'FIELD_SHIFT_MASTER_STORY_AND_GAMES.doc');

fs.writeFileSync(rootDocPath, wordHtml, 'utf-8');
fs.writeFileSync(docsDocPath, wordHtml, 'utf-8');

console.log('Successfully generated Word Documents:');
console.log(' - ' + rootDocPath);
console.log(' - ' + docsDocPath);
