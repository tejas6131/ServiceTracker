const pkgs = ['expo','expo-router','expo-sqlite','expo-notifications','expo-document-picker','expo-image-picker','expo-file-system','react-native-paper','react-native','react','react-native-screens','react-native-safe-area-context','react-native-gesture-handler','react-native-reanimated','@expo/vector-icons'];
pkgs.forEach(p => {
  try {
    const v = require(p + '/package.json').version;
    console.log('OK  ' + p + '@' + v);
  } catch(e) {
    console.log('ERR ' + p + ': NOT FOUND');
  }
});
