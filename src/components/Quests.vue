<template>
  <div id="panel-quests" class="padding-8">
    <div>常用任务</div>
    <div>
      <span class="text-btn quest-list" v-on:click="checkQuests">查询当前已接任务</span>
    </div>
    <ul>
      <li v-for="quest in quickQuests" :key="quest.id">
        <span class="text-btn quest-start" v-on:click="addQuestCommand(quest.id, 'start')">接受</span>
        <span class="text-btn quest-clear" v-on:click="addQuestCommand(quest.id, 'clear')">完成</span>
        <span class="text-btn quest-stop" v-on:click="addQuestCommand(quest.id, 'stop')">取消</span>
        <span>{{quest.type}} - </span>
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <span v-on="on">{{quest.name}}</span>
          </template>
          <span>{{quest.content}}</span>
        </v-tooltip>
      </li>
    </ul>
  </div>
</template>

<script>
import { quickQuests } from '../utils/constant';

export default {
  name: 'Quests',

  data: () => ({
    quickQuests,
  }),

  methods: {
    addQuestCommand(questId, actionType) {
      switch (actionType) {
        case 'start':
        default:
          this.$emit('addCommand', 'quest_start', {
            api_quest_id: questId,
          });
          break;
        case 'stop':
          this.$emit('addCommand', 'quest_stop', {
            api_quest_id: questId,
          });
          break;
        case 'clear':
          this.$emit('addCommand', 'quest_clear', {
            api_quest_id: questId,
          });
          break;
      }
    },
    checkQuests() {
      this.$emit('addCommand', 'questlist', {
        api_page_no: 1,
        api_tab_id: 9,
      });
      this.$emit('addCommand', 'questlist', {
        api_page_no: 2,
        api_tab_id: 9,
      });
    },
  },
};
</script>
