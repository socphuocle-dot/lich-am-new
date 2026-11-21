// Thêm target widget (WidgetKit) + plugin cầu nối vào project Xcode. Chạy một lần: node scripts/ios-add-widget.cjs
const xcode = require('xcode');
const fs = require('fs');

const P = 'ios/App/App.xcodeproj/project.pbxproj';
const p = xcode.project(P);
p.parseSync();
const o = p.hash.project.objects;
const clean = (s) => String(s || '').replace(/"/g, '');
const entries = (sec) => Object.entries(o[sec] || {}).filter(([k]) => !k.endsWith('_comment'));

if (entries('PBXNativeTarget').some(([, t]) => clean(t.name) === 'LichAmWidget')) {
  console.log('Project đã có widget, bỏ qua.');
  process.exit(0);
}

const U = () => p.generateUuid();
function fileRef(name, type, extra = {}) {
  const id = U();
  o.PBXFileReference[id] = { isa: 'PBXFileReference', lastKnownFileType: type, path: name, sourceTree: '"<group>"', ...extra };
  o.PBXFileReference[id + '_comment'] = name;
  return id;
}
function buildFile(ref, name, phase) {
  const id = U();
  o.PBXBuildFile[id] = { isa: 'PBXBuildFile', fileRef: ref, fileRef_comment: name };
  o.PBXBuildFile[id + '_comment'] = `${name} in ${phase}`;
  return { value: id, comment: `${name} in ${phase}` };
}
function phase(section, comment, files) {
  const id = U();
  o[section] = o[section] || {};
  o[section][id] = { isa: section, buildActionMask: 2147483647, files, runOnlyForDeploymentPostprocessing: 0 };
  o[section][id + '_comment'] = comment;
  return { value: id, comment };
}

const root = o.PBXProject[p.hash.project.rootObject];
const mainGroup = o.PBXGroup[root.mainGroup];
const [appTargetId, appTarget] = entries('PBXNativeTarget').find(([, t]) => clean(t.name) === 'App');
const appGroupId = mainGroup.children.find((c) => c.comment === 'App').value;
const appGroup = o.PBXGroup[appGroupId];
const productsGroup = o.PBXGroup[mainGroup.children.find((c) => c.comment === 'Products').value];

// 1) File của app: plugin cầu nối, view controller, entitlements
const appSources = o.PBXSourcesBuildPhase[appTarget.buildPhases.find((b) => b.comment === 'Sources').value];
for (const f of ['WidgetBridgePlugin.swift', 'MainViewController.swift']) {
  const r = fileRef(f, 'sourcecode.swift');
  appGroup.children.push({ value: r, comment: f });
  appSources.files.push(buildFile(r, f, 'Sources'));
}
const ent = fileRef('App.entitlements', 'text.plist.entitlements');
appGroup.children.push({ value: ent, comment: 'App.entitlements' });
for (const c of o.XCConfigurationList[appTarget.buildConfigurationList].buildConfigurations) {
  o.XCBuildConfiguration[c.value].buildSettings.CODE_SIGN_ENTITLEMENTS = 'App/App.entitlements';
}

// 2) Nhóm file của widget
const wFiles = [
  ['LichAmWidgetBundle.swift', 'sourcecode.swift', 'Sources'],
  ['Store.swift', 'sourcecode.swift', 'Sources'],
  ['Views.swift', 'sourcecode.swift', 'Sources'],
  ['calendar.json', 'text.json', 'Resources'],
  ['Info.plist', 'text.plist.xml', null],
  ['LichAmWidget.entitlements', 'text.plist.entitlements', null]
];
const wGroupId = U();
const wSources = [], wResources = [];
const children = [];
for (const [name, type, ph] of wFiles) {
  const r = fileRef(name, type);
  children.push({ value: r, comment: name });
  if (ph === 'Sources') wSources.push(buildFile(r, name, 'Sources'));
  if (ph === 'Resources') wResources.push(buildFile(r, name, 'Resources'));
}
o.PBXGroup[wGroupId] = { isa: 'PBXGroup', children, path: 'LichAmWidget', sourceTree: '"<group>"' };
o.PBXGroup[wGroupId + '_comment'] = 'LichAmWidget';
mainGroup.children.splice(mainGroup.children.findIndex((c) => c.comment === 'Products'), 0, { value: wGroupId, comment: 'LichAmWidget' });

// node-xcode chỉ thêm phụ thuộc khi đã có 2 section này
o.PBXTargetDependency = o.PBXTargetDependency || {};
o.PBXContainerItemProxy = o.PBXContainerItemProxy || {};

// 3) Target widget (node-xcode tạo cấu hình, sản phẩm .appex, bước nhúng vào app, phụ thuộc)
const target = p.addTarget('LichAmWidget', 'app_extension', 'LichAmWidget', 'vn.lichamnhacgio.app.LichAmWidget');
const nt = o.PBXNativeTarget[target.uuid];
nt.buildPhases.push(phase('PBXSourcesBuildPhase', 'Sources', wSources));
nt.buildPhases.push(phase('PBXFrameworksBuildPhase', 'Frameworks', []));
nt.buildPhases.push(phase('PBXResourcesBuildPhase', 'Resources', wResources));
if (!productsGroup.children.some((c) => c.value === nt.productReference)) productsGroup.children.push({ value: nt.productReference, comment: 'LichAmWidget.appex' });
// Bỏ các khóa "undefined" mà node-xcode ghi vào file sản phẩm
const prod = o.PBXFileReference[nt.productReference];
for (const k of Object.keys(prod)) if (prod[k] === undefined || prod[k] === 'undefined') delete prod[k];

const common = {
  APPLICATION_EXTENSION_API_ONLY: 'YES',
  CODE_SIGN_ENTITLEMENTS: 'LichAmWidget/LichAmWidget.entitlements',
  CODE_SIGN_STYLE: 'Automatic',
  CURRENT_PROJECT_VERSION: 1,
  GENERATE_INFOPLIST_FILE: 'NO',
  INFOPLIST_FILE: 'LichAmWidget/Info.plist',
  IPHONEOS_DEPLOYMENT_TARGET: '16.0',
  LD_RUNPATH_SEARCH_PATHS: '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
  MARKETING_VERSION: '1.0.0',
  PRODUCT_BUNDLE_IDENTIFIER: 'vn.lichamnhacgio.app.LichAmWidget',
  PRODUCT_NAME: '"$(TARGET_NAME)"',
  SDKROOT: 'iphoneos',
  SKIP_INSTALL: 'YES',
  SWIFT_EMIT_LOC_STRINGS: 'YES',
  SWIFT_VERSION: '5.0',
  TARGETED_DEVICE_FAMILY: '"1,2"'
};
for (const c of o.XCConfigurationList[nt.buildConfigurationList].buildConfigurations) {
  const cfg = o.XCBuildConfiguration[c.value];
  const debug = clean(cfg.name) === 'Debug';
  cfg.buildSettings = {
    ...common,
    ...(debug
      ? { SWIFT_ACTIVE_COMPILATION_CONDITIONS: 'DEBUG', SWIFT_OPTIMIZATION_LEVEL: '"-Onone"', DEBUG_INFORMATION_FORMAT: 'dwarf' }
      : { SWIFT_COMPILATION_MODE: 'wholemodule', SWIFT_OPTIMIZATION_LEVEL: '"-O"', VALIDATE_PRODUCT: 'YES' })
  };
}

// Đặt tên bước nhúng cho dễ đọc
for (const [id, ph] of entries('PBXCopyFilesBuildPhase')) {
  if (ph.files.some((f) => String(f.comment).includes('LichAmWidget'))) {
    ph.name = '"Embed Foundation Extensions"';
    o.PBXCopyFilesBuildPhase[id + '_comment'] = 'Embed Foundation Extensions';
    const ref = appTarget.buildPhases.find((b) => b.value === id);
    if (ref) ref.comment = 'Embed Foundation Extensions';
    for (const f of ph.files) {
      const bf = o.PBXBuildFile[f.value];
      if (bf) bf.settings = { ATTRIBUTES: ['RemoveHeadersOnCopy'] };
    }
  }
}
root.attributes.TargetAttributes[target.uuid] = { CreatedOnToolsVersion: '15.0' };

fs.writeFileSync(P, p.writeSync());
console.log('Đã thêm target LichAmWidget:', target.uuid);
