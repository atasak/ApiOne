# ApiOne runtime documentation

## SyncSystem
### Id's
When serialized and sent over a network, an [id](../src/util/id.ts) is 
represented as a string. This string contains `0-9`, `a-z`, `A-Z`, `-` and `_` 
characters. It should also fit inside an id mask. The mask can contain:

- A valid id character: This character will be fixed in all id's created with 
  this mask
- A `$` character: This character can be all valid id characters.
- A `+` character: This character can be all valid id characters, except for a 
  `0`. 
  
To ensure the uniqueness of id's, we make use of a separate id server. This id
server can hand out multiple id's at once upon request. Because newly created
objects cannot be used without an id, a temporary id (with a different mask) is
created, which is later resolved into a permanent id. The object cannot be 
serialized without a permanent id. To ensure this, a resolvable id object is 
created and used for all id's. 

The id server, as well as the local (temporary) id generation, is run by the
resolvable id factory

### Model management
Data model management should be implemented lazy. Upon creation, a data model
should be empty. Wrapper creation should also be lazy. The following rules for 
models exist:

1.  A data model / field should only be created when needed. When created, it
    should also exist on all receiving nodes in the network. The only 
    exceptions are: 
    - Nodes queued to be sent in batch
    - Recently created objects who's id still has to be resolved
    - Temporary zero-filled objects (5)
2.  Because of (1), a new model object should be created empty. Data wrappers 
    should check whether fields exist upon getting. 
3.  A field can contain either a Primitive (string, number, boolean) or an id, 
    which is represented as a ResolvableId. 
4.  When a non-existing field on an object get's zero-filled, a new object is
    created and assumed to be the new object, following the rules of (1) and 
    (2). 
5.  When an existing field on an object get's zero-filled, a temporary model 
    is created for it. 
    - It's id should not be resolved into a permanent id. 
    - The data is readonly, but will be updated when the data is resolved. 
    - A promise on zero-filled data should only be resolved when the data model
      is updated. 
    - Zero-filled data should correctly implement the follow algorithm. 
    - TODO: In later versions, the data set operations may be rebased on the 
      resolved data. 
    
### Data communication
A [data packet](../src/runtime/syncsystem/package.ts) (can) contain the 
following fields: 

- Version strings for:
  - `oneInterfaceVersion`: The version of the ApiOne communication interface
  - `oneImplementationVersion`: The version of the ApiOne implementation
  - `appInterfaceVersion`: The version of the data models used by the app. This
    value should only be increased when making changes to the model breaking
    the database / model structures between versions. 
  - `appImplementationVersion`: The version of the app implementation
- Headers: TODO
- Id's: 
  - `requestIds`: number of id's the sender requests
  - `requestedIds`: array of id's granted by the id server
- Request data
  - `resolve`: an object indexed by a type string, containing an array of id's
    for objects to resolve for that type. 
  - `follow`: an object indexed by a type string, containing an array of follow
    rule strings. 
- Manipulation data
  - `additive`: a tripple nested object containing additive data. The indexes
    of the objects represent the *type*, *model id* and *model field* of the 
    model object. . The final value can either be a Primitive (string, number, 
    boolean) or an id, which is represented as a string. 
  - `substractive`: a double nested object containing arrays of fields to be
    deleted from an object. The indexes of the objects represent the *type* and
    *model id* of the model object. 
    
TODO: The package may in later versions be split in id packages, manipulation
packages and request packages. 

TODO: The communication itself and the handling of race conditions. 

##### Follow algorithm
When resolving data, the follow algorithm can be used to minimize the number of
package cycles needed. The follow field of the package can be used to send
follow rules to the request server. The request server can use these rules to
predict follow-up requests, and already send this data. 

### Content hub | Package collector
The primary goal of the [content hub](../src/runtime/syncsystem/contenthub.ts) 
is managing / creating packages, communicating with other nodes in the network, 
and communicating with the content manager. 

The managing of packages is done in the package collector. The package 
collector collects data mutations and creates a 
[package](../src/runtime/syncsystem/package.ts) when the mutations get sent
over the network. Because of how id's are handled (first temporary, then 
permanently), the collector *must* wait for the resolvable id promise to 
resolve.

The hub will *not* establish / manager connections with other nodes, but
will only communicate with all objects implementing the 
[IHubConnection](../src/runtime/syncsystem/interfaces/hubconnection.ts)
interface. 

### Content manager
The content manager is responsible for handling the data models, data wrappers, 
data manipulations the wrappers cannot resolve themselves (such as the creation 
/ deletion of objects) and the communication with the hub about it. It mainly 
functions as a data router connecting: 

- The content hub
- The content wrappers
- The end user code / schema
- The content transformer

and managing: 
- The content data and the creation of it
- The content wrappers and the creation of them

##### Common actions
- **When requesting a wrapper**
  it will either be gotten from the pool or created. The accompanying content
  data object will also be gotten or created, but *will remain empty*. Fields
  should be lazily created
- **When receiving data manipulations**
  it should pass it through to the hub and/or update the models
- **When receiving new (unwrapped) data**
  it should create data wrappers for it, replace pointers with id's and update
  the hub and the models (via the data transformer)
  
### Content wrapper
A [content wrapper](../src/runtime/syncsystem/contentwrappers/wrappers.ts)
handles the data model. It provides: 

- A handler object, containing the traps. For lists / dictionaries this will 
  be a proxy, for classes it will be the manipulated class implementation
- Two data get implementations: 
  - `get`: provides the data or null. The data will be requested, but not
    zero-filled if it doesn't exist. 
  - `get_`: provides zero-filled data. The data will be requested in the
    meantime. 
  - `get$`: provides a promise. The promise will be rejected when the data
    object cannot be found. 
  - `get_$`: providex a promise. A zero-filled object will be returned if it
    doesn't exist. 
- A data set implementation
