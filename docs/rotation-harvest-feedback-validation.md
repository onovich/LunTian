# 原版轮田逻辑与结算反馈升级验证报告

phase: 原版轮田逻辑与结算反馈升级
implementation_commit: aa49cb08bcbcebf52bc108f6ff185a7c89dea8ca
status: PASS

## Scope

- 保留原有选起点、方向、路线、落点算法。
- 玩家可见语义改为起田采收、种铺换种、后续田播种、落点收成。
- `plot.seeds` 内部字段保持不重命名，界面统一显示为产量/产物。
- 增加轻量结算反馈层和 `fx-source`、`fx-exchange`、`fx-target`、`fx-cause`、`fx-result` 因果高亮。

## Validation

- `npm run build`: PASS
- `.\StartLocalTest.cmd -DryRun`: PASS
- `git diff --check`: PASS
- UTF-8 no BOM check for changed source files: PASS
- Desktop browser smoke: PASS
- Mobile browser smoke at 390x844: PASS

## Smoke Evidence

- 选择 1号田壳麦后，预览显示：采收 1号田 2 份壳麦。
- 种铺预览显示：2号田蓄水莲种 -> 3号田驱虫菊种。
- 落点预览显示：3号田「驱虫菊」收成 x2。
- 确认轮田后，日志显示壳麦产物进入种铺 -> 换出蓄水莲种 -> 2号田蓄水莲发芽。
- 第二步日志显示壳麦产物进入种铺 -> 换出驱虫菊种 -> 3号田驱虫菊发芽。
- 结算结束后，落点收成、翻出新作物、季节推进和种铺待命状态正常。
- 移动端检查未发现按钮、预览、种铺或浮字文本溢出。

## Non-scope Confirmed

- 未实现玩家手动购买种子卡。
- 未把种铺做成可交互商店。
- 未删除旧方向系统、落点策略、田患系统或农具触发。
