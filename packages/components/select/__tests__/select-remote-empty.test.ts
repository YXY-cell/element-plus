import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, test, expect, vi } from 'vitest'
import Select from '../src/select.vue'
import Option from '../src/option.vue'

describe('Select Remote Empty Slot Fix', () => {
  test('should show empty slot when remote options are cleared externally', async () => {
    // 1. 定义一个 Wrapper 组件，模拟你的 App.vue 结构
    // 这里完全复刻了 filterable, remote, 和 #empty 插槽的场景
    const wrapper = mount({
      components: {
        'el-select': Select,
        'el-option': Option,
      },
      template: `
        <el-select
          v-model="value"
          filterable
          remote
          :remote-method="remoteMethod"
        >
          <el-option
            v-for="item in options"
            :key="item.id"
            :label="item.label"
            :value="item.value"
          />
          
          <template #empty>
            <div class="my-custom-empty">
              <p>数据为空</p>
              <button>添加选项</button>
            </div>
          </template>
        </el-select>
      `,
      setup() {
        const value = ref('')
        // 初始状态：有一条数据
        const options = ref([{ id: 1, label: 'Option 1', value: 1 }])
        const remoteMethod = vi.fn()

        return {
          value,
          options,
          remoteMethod,
        }
      },
    })

    // 2. 模拟步骤一：外部清空数据 (点击“清空选项”按钮的效果)
    wrapper.vm.options = []
    await nextTick() // 等待 Vue 响应数据变化

    // 3. 模拟步骤二：点击 Select 输入框
    // 这一步触发下拉菜单的展开逻辑
    const selectWrapper = wrapper.find('.el-select__wrapper')
    expect(selectWrapper.exists()).toBe(true)
    await selectWrapper.trigger('click')
    await nextTick() // 等待下拉菜单渲染

    // 4. 断言 (Verification)：
    // 在文档中查找我们定义的 .my-custom-empty 类
    // 注意：Element Plus 的下拉菜单是 Teleport 到 body 的，所以要从 document 去找，而不是 wrapper
    const emptySlotContent = document.querySelector('.my-custom-empty')
    
    // 如果你的修复生效了，这里应该能找到元素
    expect(emptySlotContent).not.toBeNull()
    expect(emptySlotContent?.textContent).toContain('数据为空')
    
    // 额外验证：确保它确实是可见的 (在 DOM 结构中)
    // 如果之前的 Bug 存在，这里菜单根本不会渲染，emptySlotContent 会是 null
  })
})
