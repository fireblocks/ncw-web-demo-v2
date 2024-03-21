import { makeObservable } from 'mobx';
import { RootStore } from './Root.store';

export class SettingsStore {
  private _rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this._rootStore = rootStore;

    makeObservable(this);
  }
}
