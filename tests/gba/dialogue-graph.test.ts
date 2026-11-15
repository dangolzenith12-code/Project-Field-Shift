import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  INTERACTIVE_ENTITIES, 
  COLLISION_OBSTACLES, 
  DIALOGUE_NODES,
  WORLD_WIDTH, 
  WORLD_HEIGHT 
} from '../../src/components/gba/mapData.ts';

describe('GBA Overworld Dialogue Graph & World Integrity Suite', () => {
  test('all interactive entities have unique IDs and positive dimensions', () => {
    const ids = new Set<string>();
    for (const ent of INTERACTIVE_ENTITIES) {
      assert.ok(!ids.has(ent.id), `Duplicate entity ID detected: ${ent.id}`);
      ids.add(ent.id);
      assert.ok(ent.width > 0, `Entity ${ent.id} has invalid width`);
      assert.ok(ent.height > 0, `Entity ${ent.id} has invalid height`);
      assert.ok(ent.interactionRadius > 0, `Entity ${ent.id} has non-positive interaction radius`);
      assert.ok(ent.x >= 0 && ent.x <= WORLD_WIDTH, `Entity ${ent.id} is outside world X boundary`);
      assert.ok(ent.y >= 0 && ent.y <= WORLD_HEIGHT, `Entity ${ent.id} is outside world Y boundary`);
    }
  });

  test('every entity dialogueId points to an existing node in DIALOGUE_NODES', () => {
    for (const ent of INTERACTIVE_ENTITIES) {
      assert.ok(
        DIALOGUE_NODES[ent.dialogueId],
        `Entity ${ent.id} references non-existent dialogue node: ${ent.dialogueId}`
      );
    }
  });

  test('all dialogue nodes have valid speakers, portraits, and non-empty text', () => {
    const validPortraits = new Set([
      'amma_smile', 
      'amma_worry', 
      'amma_wise', 
      'agronomist', 
      'satellite', 
      'grandchild'
    ]);

    for (const [id, node] of Object.entries(DIALOGUE_NODES)) {
      assert.equal(node.id, id, `Node key ${id} does not match node.id ${node.id}`);
      assert.ok(node.speaker && node.speaker.trim().length > 0, `Node ${id} missing speaker`);
      assert.ok(validPortraits.has(node.portrait), `Node ${id} has invalid portrait: ${node.portrait}`);
      assert.ok(Array.isArray(node.text) && node.text.length > 0, `Node ${id} has empty text array`);
      for (const line of node.text) {
        assert.ok(typeof line === 'string' && line.trim().length > 0, `Node ${id} has blank text string`);
      }
    }
  });

  test('all dialogue choices have valid nextDialogueId targets or explicit action hooks', () => {
    const validActions = new Set([
      'open_compare', 
      'open_nasa', 
      'advance_season', 
      'inspect_well', 
      'calibrate_pump',
      'boost_som',
      'close',
      'play_amma_match',
      'play_banyan_blank',
      'play_america_phone',
      'play_kenya_video',
      'play_sowing',
      'play_tubewell',
      'play_sluice',
      'play_heatwave'
    ]);

    for (const [nodeId, node] of Object.entries(DIALOGUE_NODES)) {
      if (node.choices) {
        assert.ok(node.choices.length > 0, `Node ${nodeId} has empty choices array`);
        for (const choice of node.choices) {
          assert.ok(choice.text && choice.text.trim().length > 0, `Choice in ${nodeId} has blank text`);
          if (choice.nextDialogueId) {
            assert.ok(
              DIALOGUE_NODES[choice.nextDialogueId],
              `Choice "${choice.text}" in node ${nodeId} references invalid nextDialogueId: ${choice.nextDialogueId}`
            );
          } else if (choice.action) {
            assert.ok(
              validActions.has(choice.action),
              `Choice "${choice.text}" in node ${nodeId} references unhandled action: ${choice.action}`
            );
          } else {
            assert.fail(`Choice in node ${nodeId} must specify either nextDialogueId or action`);
          }
        }
      }
    }
  });

  test('all collision obstacles lie within world bounds and have positive area', () => {
    for (const [idx, obs] of COLLISION_OBSTACLES.entries()) {
      assert.ok(obs.width > 0, `Obstacle index ${idx} has invalid width: ${obs.width}`);
      assert.ok(obs.height > 0, `Obstacle index ${idx} has invalid height: ${obs.height}`);
      assert.ok(obs.x >= 0, `Obstacle ${idx} negative X coordinate`);
      assert.ok(obs.y >= 0, `Obstacle ${idx} negative Y coordinate`);
      assert.ok(obs.x + obs.width <= WORLD_WIDTH, `Obstacle ${idx} overflows world width`);
      assert.ok(obs.y + obs.height <= WORLD_HEIGHT, `Obstacle ${idx} overflows world height`);
    }
  });
});
