/**
 * Created by bailey on 16/8/11.
 */
import { addStyle } from '../utils/dom'
import "./style/index.less";
let tipVm;
export default {
    install(Vue, options){
        // tip组件模板
        const TipComponent = Vue.extend({
            template: `
                <transition name="fade">
                    <div :class="warpPlace" v-if="show">
                        <div class="ant-tooltip-content">
                                <div class="ant-tooltip-arrow"></div>
                                <div class="ant-tooltip-inner"><span v-html="tip"></span></div>
                        </div>
                    </div>
                </transition>`,
            computed:{
                warpPlace(){
                    return [
                        `ant-tooltip`,
                        `ant-tooltip-placement-${this.place}`
                    ]
                }
            }
        });

        /**
         * 获取元素的坐标位置
         * @param el
         * @returns {{top: number, left: number}}
         */
        function getOffset(el) {
            let x = 0;
            let y = 0;
            let ele = el;
            while (ele) {
                x += parseInt(ele.offsetLeft, 10);
                y += parseInt(ele.offsetTop, 10);
                ele = ele.offsetParent;
            }
            return { top: y, left: x };
        }
        /**
         * 关闭方法
         */
        function closeTooltip(el){
            if (el.vm){
                // 延时关闭,给tip本身的鼠标事件留出时间
                el.closeTimer = setTimeout(() => {
                    // show设置为false,触发view改变
                    el.vm.show = false;
                }, 100);
            }
        }

        /**
         * 显示方法
         */
        function openTooltip(el,binding){
                if(!el) return;
                // 创建一个新的tip组件实例,插入到body中
                tipVm = el.vm = new TipComponent({
                    data : {
                        tip : binding.value, // 支持html内容
                        show: true,
                        place : binding.place
                    }
                }).$mount();

                document.getElementsByTagName('body')[0].appendChild(el.vm.$el);

                //this.tooltipd = tooltipOptions.tipVm.$el;

                // 给tip组件本身绑定鼠标事件,鼠标移上去之后停止关闭操作（从而允许复制tip中的内容）,鼠标移开后关闭
                el.vm.$el.addEventListener('mouseover', () => {
                    clearTimeout(el.closeTimer);
                });
                el.vm.$el.addEventListener('mouseout', function(){closeTooltip(el)});
                el.vm.$el.addEventListener('click', function(){closeTooltip(el)});

                //设置tooltip的位置
                const offset = getOffset(el);
                const eleWidth = el.offsetWidth;
                const eleHeight = el.offsetHeight;
                var left = offset.left  ;
                var top = offset.top  ;
                const tooltipHeight = el.vm.$el.offsetHeight;
                const tooltipWidth = el.vm.$el.offsetWidth;

                switch(binding.place.toUpperCase()){
                    case 'TOP':
                        top = offset.top - tooltipHeight;
                        left = offset.left + eleWidth/2 - tooltipWidth/2;
                        break;
                    case 'TOPLEFT':
                        top = offset.top - tooltipHeight;
                        left = offset.left  ;
                        break;
                    case 'TOPRIGHT':
                        top = offset.top - tooltipHeight;
                        left = offset.left + eleWidth - tooltipWidth;
                        break;
                    case 'BOTTOM':
                        top = offset.top + eleHeight;
                        left = offset.left + eleWidth/2 - tooltipWidth/2;
                        break;
                    case 'BOTTOMLEFT':
                        top = offset.top + eleHeight;
                        left = offset.left;
                        break;
                    case 'BOTTOMRIGHT':
                        top = offset.top + eleHeight;
                        left = offset.left + eleWidth - tooltipWidth;
                        break;
                    case 'LEFT':
                        top = offset.top + eleHeight/2 - tooltipHeight/2;
                        left = offset.left - tooltipWidth;
                        break;
                    case 'LEFTTOP':
                        top = offset.top  
                        left = offset.left - tooltipWidth;
                        break;
                    case 'LEFTBOTTOM':
                        top = offset.top + eleHeight - tooltipHeight;
                        left = offset.left - tooltipWidth;
                        break;
                    case 'RIGHT':
                        top = offset.top + eleHeight/2 - tooltipHeight/2;
                        left = offset.left + eleWidth;
                        break;
                    case 'RIGHTTOP':
                        top = offset.top
                        left = offset.left + eleWidth;
                        break;
                    case 'RIGHTBOTTOM':
                        top = offset.top + eleHeight - tooltipHeight;
                        left = offset.left + eleWidth;
                        break;

                }
                // 设置位置
                addStyle(el.vm.$el, {
                    left: left+'px',
                    top: top+'px',
                    position: 'absolute'
                });
        }

        /**
         * 注册自定义指令tooltipd
         */
        const tooltipd = Vue.directive('tooltipd', {
            /**
             * 指令第一次绑定到元素时调用
             * @param el
             * @param binding
             */
            bind: function (el,binding) {
                // 准备工作
                // 识别触发事件
                if (binding.arg === 'focus'){
                    binding.openTrigger = 'focus';
                    binding.closeTrigger = 'blur';
                }else{
                    binding.openTrigger = 'mouseenter';
                    binding.closeTrigger = 'mouseleave';
                }
                // 获取位置
                binding.place = Object.keys(binding.modifiers)[0] || 'top';
                /*// 设置位置系数
                 if (tooltipOptions.place.toUpperCase().includes('LEFT')){
                 tooltipOptions.leftFactor = 0;
                 } else if (tooltipOptions.place.toUpperCase().includes('RIGHT')){
                 tooltipOptions.leftFactor = 1;
                 }
                 if (tooltipOptions.place.toUpperCase().includes('TOP')){
                 tooltipOptions.topFactor = 0;
                 } else if (tooltipOptions.place.toUpperCase().includes('BOTTOM')){
                 tooltipOptions.topFactor = 1;
                 }*/

                // 绑定触发事件
                el.addEventListener(binding.openTrigger, function(){openTooltip(el,binding)});
                el.addEventListener(binding.closeTrigger, function(){closeTooltip(el)});
                el.addEventListener('click', closeTooltip(el));
            },

            /**
             *被绑定元素所在的模板更新时调用
             * @param value
             */
            update: function (bind) {
                //this.value = value;
                // 值更新时的工作
            },

            /**
             *指令与元素解绑时调用
             * @param binding
             */
            unbind: function (el,binding) {
                // 清理工作
                // 例如，删除 bind() 添加的事件监听器
                /*this.el.removeEventListener(binding.openTrigger,function(){openTooltip(el,binding)});
                this.el.removeEventListener(binding.closeTrigger, function(){closeTooltip(el)});*/
            },
        });
    }
}