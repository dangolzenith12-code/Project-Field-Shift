# Story Script — Four Seasons of Amma's Field

## Purpose and voice

This is the story copy for the five-scene prototype. The player is a member of a family returning to a farm that Amma cared for. The story is fictional and composite; it is not a farmer interview or a claim about any one community. Keep the voice warm, grounded and curious. The model supports a conversation with farmers and local experts; it does not make a decision for them.

The story is built from six beats across five scenes. The 1990 and 2005 passages are family memories, while the 2026 and 2040 passages frame the present and a conditional future. Do not imply that the model has observed a specific household or predicts a real harvest.

## Scene 1 — The inheritance

**Story beat:** The inheritance, 1990  
**Purpose:** Introduce the field and the knowledge carried between generations.

**Narration**

> When I was small, Amma could tell where the rain had gone by looking at the soil and the leaves. She knew which corner held water after a storm, and which one dried first.
>
> I thought the field would always feel the same. Years later, Amma asked me to help care for it. I brought questions. She brought a lifetime of noticing.

**On-screen line**

> A field holds more than one season.

**Visual direction**

Begin with a quiet, healthy field at first light. Let the soil, crop rows and horizon appear in layers. Show a hand-drawn family field marker, not a map pin for a real farm.

**Player action**

Select **Begin the story** to continue.

## Scene 2 — A familiar rhythm

**Story beat:** A familiar rhythm, 2005  
**Purpose:** Let the player choose a demonstration region and understand that every place has its own calendar.

**Narration**

> By 2005, I knew the order of the work: prepare the soil, plant, tend, harvest, and begin again. Amma taught me to watch the sky, but also to ask the people who knew this place.
>
> Every region has a different rhythm. Choose a demonstration region to see one example of weather and farming context. It is a starting point for the story, not a description of every farm there.

**On-screen line**

> Where should this story begin?

**Region helper copy**

> Choose a demonstration region. The location is a regional example, not a farm address.

**Visual direction**

Show four illustrated region cards: Punjab, Iowa, Karnataka, and Machakos County, Kenya. Each card may show a small landscape cue and its broad farming context. Avoid suggesting that one crop or practice is universal across a region.

**Player action**

Choose a region, then select **Continue**.

## Scene 3 — The present field

**Story beat:** The present field, 2026  
**Purpose:** Introduce the weather record and its limits without presenting it as a farm measurement.

**Narration**

> Now it is 2026. Some seasons bring rain at a different time; some bring a longer dry spell. One week cannot tell the whole story, so we look across many seasons.
>
> These weather records come from NASA POWER for a regional point. They help us explore patterns in temperature, rain, soil wetness, evaporation and sunlight. They do not measure Amma's field, and they cannot tell us exactly what will happen next.

**On-screen labels**

- **Weather pattern:** regional NASA POWER data
- **Soil wetness:** a modelled indicator, not a soil test
- **What is missing:** local soil, field history and farmer observations

**Visual direction**

Move through the selected region's seasonal field illustration. Let the field shift among healthy, stressed and bare states as the selected weather pattern changes. Keep the transition gradual and illustrative; do not encode a single indicator as a diagnosis.

**Player action**

Select **See the possible paths**.

## Scene 4 — Three paths to compare

**Story beat:** Three possible paths  
**Purpose:** Compare choices as questions, with evidence, uncertainty and trade-offs visible.

**Lead-in narration**

> Amma never called one season a verdict. She asked what had worked, what had changed, and what we could try next.
>
> Here are three paths to compare. Each one makes different trade-offs. The numbers are outputs from a simple rule-based model, not yield forecasts or instructions.

### Path 1 — Keep the familiar rotation

**Card text**

> Start with the existing crop rhythm as a baseline. What might happen if we keep doing what we know?

**Prompt**

> Which parts of the familiar plan still serve this field?

### Path 2 — Build resilience

**Card text**

> Explore a rotation with more soil cover and a mix of crops. It may use water differently and can bring its own costs and timing needs.

**Prompt**

> What would need to be true for this path to work here?

### Path 3 — Protect near-term income

**Card text**

> Explore a path that gives more weight to near-term income. A stronger short-term result can come with other trade-offs.

**Prompt**

> Which trade-offs would matter most to this household?

**Evidence and uncertainty copy**

> **What the model used:** the selected regional weather series and the crop traits listed in this prototype.  
> **What it does not know:** this farm's soil test, prices, labor, irrigation access, pests, seed choices or local crop calendar.  
> **How to read the range:** the band shows how outcomes vary across the model's tested conditions. It is not a promise or a probability for a real farm.

**Player action**

Compare the three cards and select **Look ahead**.

## Scene 5 — A future to test

**Story beats:** A future to test, 2040; the farmer's decision  
**Purpose:** Show a conditional future and return the choice to the farmer and local expertise.

**Narration**

> It is 2040 in this what-if story. We can change an assumption and see how the paths respond. That is a way to ask better questions, not a way to see the future.
>
> Amma would ask what the model left out. She would ask the neighbors what they had seen. Then the people who live with the decision would decide what, if anything, to try.
>
> The field is still theirs. The data can help start the conversation.

**On-screen line**

> A scenario is a question, not a prediction.

**Reflection prompts**

- Which path would you want to discuss with a local farmer or advisor?
- What local information would change your mind?
- What would you test on a small area before changing the whole field?

**Closing line**

> Field Shift supports farmers and local experts. It does not replace their judgement.

**Player actions**

Choose **Reflect** to finish, or **Compare paths** to revisit the options.

## Implementation notes

- Keep the regional weather source, data gaps and scenario limits visible beside the comparison; do not hide them in a tooltip.
- Populate numeric fields only from the simulation output. If a result is unavailable, show “Not available in this prototype” rather than inventing a value.
- Label all model outputs as illustrative scenarios. Do not call them predictions, recommendations, actual farm conditions or expected yields.
- Preserve the player's region and choices when moving backward between scenes.
- Provide text alternatives for the animated field states and ensure narration is readable without sound.

## Glossary — first 10 entries

1. **NDVI:** A satellite measure of how green plants look from above. Greener does not always mean healthier; the number needs local context.
2. **Evapotranspiration:** Water moving from the soil and plants into the air. It combines evaporation from the ground with water released by leaves.
3. **Soil moisture anomaly:** How wet or dry the soil looks compared with what is usual for that place and time. It is a comparison, not a soil test.
4. **Frost risk:** The chance that cold air may damage sensitive plants. A regional temperature record cannot show the exact temperature beside a particular field.
5. **Root-zone wetness:** A modelled estimate of water in the deeper soil where many crop roots grow. It is not the same as measuring water in the field.
6. **Growing degree days:** A way to add up warmth over time. Farmers and researchers use it to describe how quickly a crop may develop.
7. **Land surface temperature:** The temperature of the ground and things on it, seen by a satellite. It is different from the air temperature people feel.
8. **Weekly rainfall:** Rain added up over a week. The same weekly total can affect crops differently depending on when the rain fell.
9. **Soil organic matter:** Old plant and animal material in the soil. It helps build soil structure and supports water and nutrient storage over time.
10. **Scenario:** A “what if” run that shows how a set of choices and assumptions behave in the model. It is not a forecast of what will happen.
