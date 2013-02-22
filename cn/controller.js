/**
 * @fileoverview The stateless controller functions.
 *
 * @author joseph@cs.utexas.edu (Joe Tessler)
 */

goog.provide('cn.controller');

goog.require('cn.model.Command');
goog.require('cn.model.Game');
goog.require('cn.view.Animator');


/**
 * @param {!cn.model.Game} game The current game.
 * @param {!cn.view.Animator} animator The animator in which to draw bot and
 *     cargo animations.
 */
cn.controller.play = function(game, animator) {
  var command = game.program.next(game.bot);
  if (goog.isDefAndNotNull(command)) {
    switch (command) {
      case cn.model.Command.LEFT:
        cn.controller.moveLeft(game, animator);
        break;
      case cn.model.Command.RIGHT:
        cn.controller.moveRight(game, animator);
        break;
      case cn.model.Command.DOWN:
        cn.controller.moveDown(game, animator);
        break;
      case cn.model.Command.F0:
      case cn.model.Command.F1:
      case cn.model.Command.F2:
      case cn.model.Command.F3:
        cn.controller.play(game, animator);
        break;
      default:
        throw Error('Animation not implemented for "' + command + '"');
    }
  }
};


/**
 * @param {!cn.model.Game} game The current game.
 * @param {!cn.view.Animator} animator The animator in which to draw bot and
 *     cargo animations.
 */
cn.controller.moveLeft = function(game, animator) {
  var nextStack = game.level.stacks[game.bot.position - 1];
  animator.attachAnimation(
      function() { return game.bot.getX() > nextStack.getX(); },
      function() { game.bot.translate(-1, 0); },
      function() {
        game.bot.position--;
        cn.controller.play(game, animator);
      });
};


/**
 * @param {!cn.model.Game} game The current game.
 * @param {!cn.view.Animator} animator The animator in which to draw bot and
 *     cargo animations.
 */
cn.controller.moveRight = function(game, animator) {
  var nextStack = game.level.stacks[game.bot.position + 1];
  animator.attachAnimation(
      function() { return game.bot.getX() < nextStack.getX(); },
      function() { game.bot.translate(1, 0); },
      function() {
        game.bot.position++;
        cn.controller.play(game, animator);
      });
};


/**
 * @param {!cn.model.Game} game The current game.
 * @param {!cn.view.Animator} animator The animator in which to draw bot and
 *     cargo animations.
 */
cn.controller.moveDown = function(game, animator) {
  var startingY = game.bot.getY();
  var stack = game.level.stacks[game.bot.position];
  animator.attachAnimation(
      function() {
        if (stack.size() > 0) {
          return game.bot.hasCargo() ?
              game.bot.getY() < stack.getTopCargo().getY() - game.bot.height :
              game.bot.getInnerY() < stack.getTopCargo().getY();
        }
        return game.bot.getY() < stack.getY() - game.bot.height;
      },
      function() { game.bot.translate(0, 1); },
      function() {
        if (game.bot.hasCargo()) {
          stack.addCargo(game.bot.detachCargo());
        } else if (stack.size() > 0) {
          game.bot.attachCargo(stack.liftCargo());
        }
        cn.controller.moveUp(game, animator, startingY);
      });
};


/**
 * @param {!cn.model.Game} game The current game.
 * @param {!cn.view.Animator} animator The animator in which to draw bot and
 *     cargo animations.
 * @param {number} endingY The y value to move the bot to.
 */
cn.controller.moveUp = function(game, animator, endingY) {
  animator.attachAnimation(
      function() { return game.bot.getY() > endingY; },
      function() { game.bot.translate(0, -1); },
      function() {
        cn.controller.play(game, animator);
      });
};