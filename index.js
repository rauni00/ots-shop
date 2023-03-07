import firebase from 'firebase/compat/app'; //v9
import 'firebase/compat/auth'; //v9
import 'firebase/compat/firestore'; //v9
import express from 'express';
const app = express();
import validateProfileInput from './validation/setProfile.cjs';
import validateItemInput from './validation/Item.cjs';
import key from './serviceAccountKey.js';

import bodyParser from 'body-parser';
const port = process.env.PORT || 4000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//! firebase connection
try {
	firebase.initializeApp(key);
	console.log('Firebase Database Connected Success');
} catch (error) {
	console.log('===============', error);
}
//! database connection
const db = firebase.firestore();
const auth = firebase.auth();

app.get('/', (req, res) => {
	res.send('<h1>WELCOME TO E-SHOP </h1>');
});
//! auth with firebase auth
app.post('/register', (req, res) => {
	if (!req.body.email) {
		return res.status(400).json({ email: 'email is require' });
	} else {
		if (!req.body.password) {
			return res.status(400).json({ password: 'password is require' });
		}
	}
	auth.createUserWithEmailAndPassword(req.body.email, req.body.password)
		.then((newUser) => {
			res.status(200).json({ msg: newUser });
		})
		.catch((err) => {
			res.json(err.message);
		});
});

//! login user
app.post('/login', (req, res) => {
	if (!req.body.email) {
		return res.status(400).json({ email: 'email is require' });
	} else {
		if (!req.body.password) {
			return res.status(400).json({ password: 'password is require' });
		}
	}
	auth.signInWithEmailAndPassword(req.body.email, req.body.password)
		.then((register) => {
			res.json(register);
		})
		.catch((error) => {
			if (error.code == 'auth/wrong-password') {
				res.status(400).json({ password: 'wrong-password' });
			} else {
				if (error.code == 'auth/user-not-found') {
					res.status(400).json({ User: 'User not Found' });
				}
			}
		});
});

// !Forget Password
app.post('/forget', (req, res) => {
	if (!req.body.email) {
		return res.status(400).json({ email: 'email is require' });
	}
	auth.sendPasswordResetEmail(req.body.email)
		.then((send) => {
			res.json('Password reset email link sent');
		})
		.catch((error) => {
			res.json(error.code);
		});
});

// !User Profile
app.post('/setProfile', (req, res) => {
	const { errors, isValid } = validateProfileInput(req.body);
	if (!isValid) {
		return res.status(400).json(errors);
	} else {
		auth.onAuthStateChanged((user) => {
			const fields = {
				fullName: req.body.fullName,
				email: user.email,
				Mobile: req.body.Mobile,
			};

			db.collection('users')
				.doc(req.headers['uid'])
				.set(fields)
				.then((user) => {
					res.json(user);
				})
				.catch((err) => {
					res.json(err);
				});
		});
	}
});

// ! Get User Profile
app.get('/profile', (req, res) => {
	db.collection('users')
		.doc(req.headers['uid'])
		.get()
		.then((user) => {
			let Category = {};
			Category = user.data();
			Category['id'] = user.id;
			res.json(Category);
		})
		.catch((err) => {
			res.json(err);
		});
});

//! Create Category
app.post('/createCategory', (req, res) => {
	if (!req.body.Category) {
		return res.status(400).json({ category: 'category is require' });
	}
	const categoryFields = {
		Category: req.body.Category,
		image: req.body.image,
	};
	db.collection('category')
		.doc()
		.set(categoryFields)
		.then((category) => {
			res.json(category);
		})
		.catch((error) => {
			res.json(error);
		});
});
// ! Get Category
app.get('/getCategory', (req, res) => {
	db.collection('category')
		.get()
		.then((category) => {
			let temp = [];
			category.forEach((documentSnapshot) => {
				let Category = {};
				Category = documentSnapshot.data();
				Category['id'] = documentSnapshot.id;
				temp.push(Category);
			});
			res.json(temp);
		})
		.catch((error) => {
			res.json(error);
		});
});

//! Create Item
app.post('/createItem', (req, res) => {
	const { errors, isValid } = validateItemInput(req.body);
	if (!isValid) {
		return res.status(400).json(errors);
	}
	// create Validation
	const Item = {
		name: req.body.name,
		image: req.body.image,
		price: req.body.price,
		description: req.body.description,
		categoryId: req.body.categoryId,
	};
	db.collection('Items')
		.doc()
		.set(Item)
		.then((item) => {
			res.status(200).json({ msg: 'success' });
		})
		.catch((err) => {
			res.status(400).json({ err: err });
		});
});

//! Getting Items of category
app.get('/getItem', (req, res) => {
	db.collection('Items')
		.where('categoryId', '==', req.body.categoryId)
		.get()
		.then((item) => {
			let temp = [];
			item.forEach((documentSnapshot) => {
				let items = {};
				items = documentSnapshot.data();
				items['id'] = documentSnapshot.id;
				temp.push(items);
			});
			res.json(temp);
		})
		.catch((error) => {
			res.json(error);
		});
});

// ! likes
app.post('/like', (req, res) => {
	const likes = {
		PostId: req.body.PostId,
		userId: req.headers['uid'],
		// like: req.body.like,
		like: true,
	};
	db.collection('posts')
		.doc(req.body.PostId)
		.update({ likes: firebase.firestore.FieldValue.arrayUnion(likes) })
		.then((like) => {
			res.json(like);
		})
		.catch((error) => {
			res.json(error);
		});
});

app.listen(port, () => console.log(`Server is listen at ${port}`));
