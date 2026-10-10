import 'react-native';
import React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface ElementClass extends React.Component<any> {
      render(): React.ReactElement<any, any>;
    }
    interface ElementAttributesProperty { props: {}; }
    interface ElementChildrenAttribute { children: {}; }
    interface IntrinsicElements {
      View: React.ComponentProps<typeof import('react-native').View>;
      Text: React.ComponentProps<typeof import('react-native').Text>;
      ScrollView: React.ComponentProps<typeof import('react-native').ScrollView>;
      FlatList: React.ComponentProps<typeof import('react-native').FlatList>;
      TouchableOpacity: React.ComponentProps<typeof import('react-native').TouchableOpacity>;
      TextInput: React.ComponentProps<typeof import('react-native').TextInput>;
      Image: React.ComponentProps<typeof import('react-native').Image>;
      ActivityIndicator: React.ComponentProps<typeof import('react-native').ActivityIndicator>;
      RefreshControl: React.ComponentProps<typeof import('react-native').RefreshControl>;
      Modal: React.ComponentProps<typeof import('react-native').Modal>;
      SafeAreaView: React.ComponentProps<typeof import('react-native').SafeAreaView>;
      KeyboardAvoidingView: React.ComponentProps<typeof import('react-native').KeyboardAvoidingView>;
      StatusBar: React.ComponentProps<typeof import('react-native').StatusBar>;
      [elemName: string]: any;
    }
  }
}