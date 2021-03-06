/* @flow */
import React, { Component } from "react";
import { View, StyleSheet, Image } from "react-native";
import { connect } from "react-redux";
import findIndex from "lodash/findIndex";
import type { Account } from "@ledgerhq/wallet-common/lib/types";
import { visibleAccountsSelector } from "../../reducers/accounts";
import ScreenGeneric from "../../components/ScreenGeneric";
import colors from "../../colors";
import AccountExpanded from "./AccountExpanded";
import AccountBodyHeader from "./AccountBodyHeader";
import AccountBody from "./AccountBody";
import Header from "./Header";
import AccountHeader from "./AccountHeader";

const mapStateToProps = state => ({
  accounts: visibleAccountsSelector(state)
});

const navigationOptions = {
  tabBarIcon: ({ tintColor }: { tintColor: string }) => (
    <Image
      source={require("../../images/accounts.png")}
      style={{ tintColor, width: 32, height: 32 }}
    />
  )
};
type Props = {
  accounts: Account[],
  navigation: *,
  screenProps: {
    topLevelNavigation: *
  }
};
class Accounts extends Component<
  Props,
  {
    expandedMode: boolean,
    selectedIndex: number,
    headerScrolled: boolean
  }
> {
  static navigationOptions = navigationOptions;
  static getDerivedStateFromProps(nextProps: Props, prevState) {
    const accountId = nextProps.navigation.state.params
      ? nextProps.navigation.state.params.accountId
      : null;
    if (accountId && accountId !== prevState.navigationFocusAccountId) {
      const selectedIndex = findIndex(
        nextProps.accounts,
        acc => acc.id === accountId
      );
      return {
        selectedIndex,
        expandedMode: false,
        navigationFocusAccountId: accountId
      };
    }
    return null;
  }

  state = {
    expandedMode: false,
    selectedIndex: 0,
    headerScrolled: false,
    navigationFocusAccountId: null
  };

  onToggleExpandedMode = () => {
    this.setState(({ expandedMode }) => ({ expandedMode: !expandedMode }));
  };

  onAddAccount = () => {
    this.props.screenProps.topLevelNavigation.navigate({
      routeName: "AddAccount",
      key: "addaccount"
    });
  };

  onPressExpandedItem = (selectedIndex: number) => {
    this.setState({ selectedIndex, expandedMode: false });
  };

  onSelectIndex = (selectedIndex: number) => {
    this.setState({ selectedIndex });
  };

  onScroll = ({
    nativeEvent: { contentOffset }
  }: {
    nativeEvent: { contentOffset: { y: number } }
  }) => {
    const headerScrolled = contentOffset.y > 300;
    this.setState(
      s => (headerScrolled !== s.headerScrolled ? { headerScrolled } : null)
    );
  };

  accountBody: ?AccountBody;
  onAccountBodyRef = (accountBody: ?AccountBody) => {
    this.accountBody = accountBody;
  };

  scrollUp = () => {
    const { accountBody } = this;
    if (accountBody) accountBody.scrollUp();
  };

  renderHeader = () => {
    const { expandedMode, selectedIndex, headerScrolled } = this.state;
    const { accounts } = this.props;
    const account = accounts[selectedIndex];
    if (headerScrolled && account) {
      return <AccountHeader account={account} />;
    }
    return (
      <Header
        expandedMode={expandedMode}
        onToggleExpandedMode={this.onToggleExpandedMode}
        onAddAccount={this.onAddAccount}
      />
    );
  };

  renderAccountBodyHeader = () => {
    const { selectedIndex } = this.state;
    const { accounts, screenProps: { topLevelNavigation } } = this.props;
    return (
      <AccountBodyHeader
        accounts={accounts}
        topLevelNavigation={topLevelNavigation}
        selectedIndex={selectedIndex}
        onSelectIndex={this.onSelectIndex}
      />
    );
  };

  render() {
    const { expandedMode, selectedIndex } = this.state;
    const { accounts, screenProps: { topLevelNavigation } } = this.props;
    const account = accounts[selectedIndex];
    return (
      <View style={styles.root}>
        <ScreenGeneric Header={this.renderHeader} onPressHeader={this.scrollUp}>
          <View style={styles.topBackground} />
          {/* FIXME perf are not good, investigate why */}
          {expandedMode ? (
            <AccountExpanded
              accounts={accounts}
              onPressExpandedItem={this.onPressExpandedItem}
            />
          ) : null}
          <AccountBody
            ref={this.onAccountBodyRef}
            visible={!expandedMode}
            topLevelNavigation={topLevelNavigation}
            account={account}
            Header={this.renderAccountBodyHeader}
            onScroll={this.onScroll}
          />
        </ScreenGeneric>
      </View>
    );
  }
}

export default connect(mapStateToProps)(Accounts);

const styles = StyleSheet.create({
  topBackground: {
    position: "absolute",
    top: 0,
    width: 600,
    height: 300,
    backgroundColor: colors.blue
  },
  root: {
    flex: 1
  }
});
