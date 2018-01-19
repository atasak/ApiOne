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
    - Nodes queued to be sent in batch. There should be no timeouts between the
      first request of the batch and the sending, only async callbacks. 
    - Recently created objects who's id has to be resolved before we can send
      them. 
    - Temporary zero-filled objects (4)
    
2.  Because of (1), a new model object should be created empty. Data wrappers 
    should check whether fields exist upon getting. 
    
3.  A field can contain either a Primitive (string, number, boolean) or an id, 
    which is represented as a ResolvableId. When serializing to JSON, the id 
    will be represented as a single string. 
    
4.  When objects or fields do not exist yet, they can get zero-filled. The 
    zero-filling algorithms have the following tasks:
    
    - Determining the state of zero-filled objects, which can either be 
      `Temporary` or `Permanent`: 
      - A field of a temporary object gets `Temporary`
      - An existing field of a permanent object gets `Temporary`
      - A non-existing field of a permanent object gets `Permanent`, as it is
        the first creation of the object. 
      - A lookup in an object with a temporary index get `Temporary`    
    - Keep track of the mutations on temporary zero-filled objects so they can 
      be replayed on the resolved objects, when needed. 
    - Automatically resolving the zero-filled objects, so the real data will 
      be fetched for later use. 
    - Determining the way the data is read from the model. Use this date to 
      create [follow rules](#follow-algorithm) (5). 
      
5.  Follow rules use predictive rules to determine what data will be requested
    in the near future. This way, we can request (probably a bit too much) data
    the user will need, to prevent, for example, separate http requests for 
    each iteration of a loop. 
    
    - The follow rule building ends whenever, from any object: 
      - The promise is then'd
      - A primitive value is read
      - The fetch() is called 
    - When permanent objects are read, we do not have to resolve anything or 
      create any rules. The following rules are for temporary objects only:
    - When the chain is empty, add the type and id to the chain as root
    - When a field is statically read (with the `.` operator), the field is
      added to the follow chain with the `.`-rule
    - When a field is dynamically read, the entire follow rule for the lookup 
      can be included in the `[lookup]`-rule
    - When an [Iterate](../src/util/iterate.ts) is encountered, the iterator 
      should create rules for the iterate using the rulebook. 
    
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

- Follow rules: `f#t:ir`, where: 
  - `f` is the filename of the type, 
  - `t` is the type of the root object, 
  - `i` is the id of the root object, 
  - `r` are rule parts.
- Rule parts: `r.x   r[]   r[x-y]   r[x]   r[x1, x2, ...]   r[x | y]`:
  0.  `_`: empty. Lookup the object defined by the `f#t:i` before. 
  1.  `r.x`: lookup string `x` in `r`
  2.  `r[]`: lookup all values in `r`
  3.  `r['x']`: lookup string x in `r`
  4.  `r[x-y]`: lookup all indexes `x` to `y` in array `r`
  5.  `r[x]`: lookup all indexes generated by rule `x` in `r`
  6.  `r[x1, x2, ...]`: lookup all indexes generated by `xn` for all `n`, where
      all `xn` are rules like rules 3-5. 
  7.  `r[x | f]`: filter rules `x` with condition `y`, where `x` is a rule like
      rules `3-6` and `f` is a filter. 
- Filters: `r * p`, where:  
  - `r` is a follow rule, or `$r` where `r` are rule parts and `$` denotes the 
    object the filter is applied on, 
  - `*` is the expression operation: `<`, `<=`, `=`, `>=`, `>`, `!=`
  - `p` is a primitive or a follow rule with the added `$` option. 

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
