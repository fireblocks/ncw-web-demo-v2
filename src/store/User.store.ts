import { makeObservable, observable } from 'mobx';

export class UserStore {
  @observable public id: string;

  constructor() {
    this.id = '';

    makeObservable(this);
  }
}
