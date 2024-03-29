import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImage: {
      ref: {
        type: String,
        default: "",
      },
      imageSrc: {
        type: String,
        default: "",
      },
    },
    //TODO: remove posts from model once playlist functionality has been completed
    posts: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
          required: true,
        },
        path: {
          type: Array,
          required: true,
        },
      },
    ],
    followers: {
      type: Array,
      default: [],
    },
    following: {
      type: Array,
      default: [],
    },
    blockedUsers: {
      type: Array,
      default: [],
    },
    playlists: [
      {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Playlist",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    role: {
      type: String,
      default: "user",
      enum: ["user", "moderator", "admin"], //user role must be 1 of these
    },
    resetLink: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model("User", userSchema)

export default User
