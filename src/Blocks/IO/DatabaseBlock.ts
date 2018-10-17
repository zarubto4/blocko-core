import { Block, ConfigProperty, ConnectorEvent, JsonConnector } from '../../Core';
import { Types } from 'common-lib';
import { ConfigPropertyType } from 'common-lib/build/Types';
import { DatabaseDao } from '../../Core/Database';

export class DatabaseBlock extends Block {

    protected input: JsonConnector;
    protected connectionString: ConfigProperty;
    protected databaseName: ConfigProperty;
    protected collectionName: ConfigProperty;

    protected dao: DatabaseDao;

    constructor() {
        super(null, 'databaseBlock');
        this.name = 'databaseBlock';
        this.description = 'Block for accessing Mongo Database.';
    }

    public initialize(): void {
        this.input = <JsonConnector>this.addInputConnector('input', Types.ConnectorType.JsonInput, 'JSON Input');
        this.connectionString = this.addConfigProperty(ConfigPropertyType.String, 'connectionString', 'Connection String', 'changeme');
        this.databaseName = this.addConfigProperty(ConfigPropertyType.String, 'databaseName', 'Database Name', 'changeme');
        this.collectionName = this.addConfigProperty(ConfigPropertyType.String, 'collectionName', 'Collection Name', 'changeme');
    }

    public inputChanged(event: ConnectorEvent): void {
        if (this.dao) {
            this.dao.insert(event.value);
        } else {
            // TODO some error?
        }
    }

    public configChanged(): void {
        if (this.connectionString.value !== 'changeme' && this.databaseName.value !== 'changeme' && this.collectionName.value !== 'changeme') {
            this._controller.database.getDao(this.connectionString.value, this.databaseName.value, this.collectionName.value)
                .then((dao: DatabaseDao) => {
                    this.dao = dao;
                })
                .catch((error) => {
                    console.error(error)
                });
        }
    }
}
