import { Block, ConfigProperty, ConnectorEvent, JsonConnector } from '../../Core';
import { DatabaseDao } from '../../Core/Database';
export declare class DatabaseBlock extends Block {
    protected input: JsonConnector;
    protected connectionString: ConfigProperty;
    protected databaseName: ConfigProperty;
    protected collectionName: ConfigProperty;
    protected dao: DatabaseDao;
    constructor();
    initialize(): void;
    inputChanged(event: ConnectorEvent): void;
    configChanged(): void;
}
