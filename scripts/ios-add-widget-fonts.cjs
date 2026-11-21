// Thêm font Be Vietnam Pro + chữ số Noto Serif vào target widget iOS. Chạy: node scripts/ios-add-widget-fonts.cjs
const xcode = require('xcode');
const fs = require('fs');
const P = 'ios/App/App.xcodeproj/project.pbxproj';
const p = xcode.project(P);
p.parseSync();
const o = p.hash.project.objects;
const clean = (s) => String(s || '').replace(/"/g, '');
const entries = (sec) => Object.entries(o[sec] || {}).filter(([k]) => !k.endsWith('_comment'));
const [, wt] = entries('PBXNativeTarget').find(([, t]) => clean(t.name) === 'LichAmWidget');
const res = o.PBXResourcesBuildPhase[wt.buildPhases.find((b) => b.comment === 'Resources').value];
const [, group] = entries('PBXGroup').find(([, g]) => clean(g.path) === 'LichAmWidget');
for (const name of ['BeVietnamPro-Regular.ttf', 'BeVietnamPro-SemiBold.ttf', 'BeVietnamPro-Bold.ttf', 'NotoSerifDigits.ttf']) {
  if (group.children.some((c) => c.comment === name)) continue;
  const ref = p.generateUuid(), bf = p.generateUuid();
  o.PBXFileReference[ref] = { isa: 'PBXFileReference', lastKnownFileType: 'file', path: name, sourceTree: '"<group>"' };
  o.PBXFileReference[ref + '_comment'] = name;
  o.PBXBuildFile[bf] = { isa: 'PBXBuildFile', fileRef: ref, fileRef_comment: name };
  o.PBXBuildFile[bf + '_comment'] = `${name} in Resources`;
  group.children.push({ value: ref, comment: name });
  res.files.push({ value: bf, comment: `${name} in Resources` });
}
fs.writeFileSync(P, p.writeSync());
console.log('Đã thêm font vào widget');
