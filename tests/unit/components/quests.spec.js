import { shallowMount, createLocalVue } from '@vue/test-utils';
import Quests from '@/components/Quests.vue';

describe('测试 Quests.vue', () => {
  let localVue;
  let wrapper;
  beforeEach(() => {
    localVue = createLocalVue();
    wrapper = shallowMount(Quests, {
      localVue,
      stubs: {
        VTooltip: '<div></div>',
      },
    });
  });
  afterEach(() => {
    if (!wrapper) {
      return;
    }
    wrapper = null;
  });

  it('列表数量不为 0', () => {
    const questsList = wrapper.findAll('li');
    expect(questsList.length).toBeGreaterThan(0);
  });

  it('任务按钮点击应有正确的参数', () => {
    const addQuestCommand = jest.fn();
    wrapper.setMethods({ addQuestCommand });

    wrapper.find('.quest-start').trigger('click');
    expect(addQuestCommand).toBeCalledWith(201, 'start');

    wrapper.find('.quest-clear').trigger('click');
    expect(addQuestCommand).toBeCalledWith(201, 'clear');

    wrapper.find('.quest-stop').trigger('click');
    expect(addQuestCommand).toBeCalledWith(201, 'stop');
  });

  it('addQuestCommand 应该触发事件', () => {
    wrapper.vm.addQuestCommand(201, 'start');
    expect(wrapper.emitted().addCommand).toBeTruthy();
  });

  it('任务列表按钮点击测试', async () => {
    const checkQuests = jest.fn();
    wrapper.setMethods({ checkQuests });

    const questListButton = wrapper.find('.quest-list');
    expect(questListButton.is('span.quest-list')).toBeTruthy();
    await questListButton.trigger('click');
    expect(checkQuests).toBeCalled();
  });

  it('checkQuests 应该触发 2 次事件', () => {
    wrapper.vm.checkQuests();
    expect(wrapper.emitted().addCommand).toBeTruthy();
    expect(wrapper.emitted().addCommand.length).toBe(2);
  });
});
